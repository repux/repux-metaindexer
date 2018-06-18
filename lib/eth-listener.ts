import {Registry} from "./services/registry";
import {ContractFactory} from "./services/contract-factory";
import {Logger} from "./utils/logger";
import {LastBlock} from "./utils/last-block";
import {DataProductUpdater} from "./services/data-product-updater";
const path = require('path');
const Web3 = require('web3');
const config = require('../config/config');
const esClient = require('./elasticsearch/client');

const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumHost));
const logger = Logger.init('ETH-LISTENER');

const lastBlockFilepath = path.join(__dirname, '../', 'data', 'lastReadBlock.dat');
const lastBlock = new LastBlock(config.startBlock, lastBlockFilepath);
const startBlockNumber = lastBlock.read();
const toBlockNumber = 'latest';

const watcherConfig = { fromBlock: startBlockNumber, toBlock: toBlockNumber };

logger.info('_____ RESTART ______');
logger.info('[1] Registry address set to: ' + config.registryAddress);
logger.info('[2] Connecting to: ' + config.ethereumHost);
logger.info('[3] Current block:' + web3.eth.blockNumber + '. Start block:' + startBlockNumber + ' to block:' + toBlockNumber);

const registryContractFactory = new ContractFactory(require('../contracts/Registry.json'), web3.currentProvider);
const dataProductContractFactory = new ContractFactory(require('../contracts/DataProduct.json'), web3.currentProvider);
const registry = new Registry(registryContractFactory, dataProductContractFactory, logger);

const dataProductUpdater = new DataProductUpdater(esClient, config.elasticsearch.index, config.ipfs, web3, logger);

registry.watchDataProductChange(
    config.registryAddress,
    watcherConfig,
    async (event: any) => {
        try {
            await dataProductUpdater.handleDataProductUpdate(event.contract, event.blockNumber, event.action);
        } catch (e) {
            logger.error(e);
        }
    }
);

lastBlock.watch(web3, config.lastBlockSaveInterval);
