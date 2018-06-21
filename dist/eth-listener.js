"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("./services/registry");
const contract_factory_1 = require("./services/contract-factory");
const logger_1 = require("./utils/logger");
const last_block_1 = require("./utils/last-block");
const data_product_updater_1 = require("./services/data-product-updater");
const path = require('path');
const Web3 = require('web3');
const config = require('../config/config');
const esClient = require('./elasticsearch/client');
(async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumHost));
    const logger = logger_1.Logger.init('ETH-LISTENER');
    const lastBlockFilepath = path.join(__dirname, '../', 'data', 'lastReadBlock.dat');
    const lastBlock = new last_block_1.LastBlock(config.startBlock, lastBlockFilepath);
    const startBlockNumber = lastBlock.read();
    const toBlockNumber = 'latest';
    const watcherConfig = { fromBlock: startBlockNumber, toBlock: toBlockNumber };
    logger.info('_____ RESTART ______');
    logger.info('[1] Registry address set to: ' + config.registryAddress);
    logger.info('[2] Connecting to: ' + config.ethereumHost);
    logger.info('[3] Current block:' + web3.eth.blockNumber + '. Start block:' + startBlockNumber + ' to block:' + toBlockNumber);
    const registryContractFactory = new contract_factory_1.ContractFactory(require('../contracts/Registry.json'), web3.currentProvider);
    const dataProductContractFactory = new contract_factory_1.ContractFactory(require('../contracts/DataProduct.json'), web3.currentProvider);
    const tokenContractFactory = new contract_factory_1.ContractFactory(require(`../contracts/${config.tokenContractName}.json`), web3.currentProvider);
    const registry = new registry_1.Registry(registryContractFactory, dataProductContractFactory, logger);
    const token = await tokenContractFactory.at(config.tokenAddress);
    const dataProductUpdater = new data_product_updater_1.DataProductUpdater(esClient, config.elasticsearch.index, config.ipfs, web3, logger, token);
    registry.watchDataProductChange(config.registryAddress, watcherConfig, async (event) => {
        try {
            await dataProductUpdater.handleDataProductUpdate(event.contract, event.blockNumber, event.action);
        }
        catch (e) {
            logger.error(e);
        }
    });
    lastBlock.watch(web3, config.lastBlockSaveInterval);
})();
