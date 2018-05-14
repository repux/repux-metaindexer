const Web3 = require("web3");
const Logger = require('./utils/logger');
const LastBlock = require('./utils/last-block');
const RegistryContract = require('./contracts/registry-contract');
const TruffleContract = require('./utils/truffle-contract');
const config = require('../config/config');
const path = require('path');
const esClient = require('./elasticsearch/client');
const DataProductUpdater = require('./elasticsearch/data-product-updater');

const logger = Logger.init('ETH');

let lastBlockFilepath = path.join(__dirname, '../', 'data', 'lastReadBlock.dat');
let lastBlock = new LastBlock(config.startBlock, lastBlockFilepath, logger);
let startBlockNumber = lastBlock.read();
let toBlockNumber = 'latest';

let web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumHost));

logger.info('_____ RESTART ______');
logger.info('[1] Registry address set to: ' + config.registryAddress);
logger.info('[2] Connecting to: ' + config.ethereumHost);
logger.info('[3] Current block:' + web3.eth.blockNumber + '. Start block:' + startBlockNumber + ' to block:' + toBlockNumber);

const registryContract = new RegistryContract(
    require('../contracts/Registry.json'),
    web3.currentProvider,
    config.registryAddress
);

const DataProductTruffleContract = TruffleContract.getInstance(
    require('../contracts/DataProduct.json'),
    web3.currentProvider
);

const dataProductUpdater = new DataProductUpdater(
    esClient,
    config.elasticsearch.index,
    DataProductTruffleContract,
    config.ipfs,
    logger
);

const watcherConfig = { fromBlock: startBlockNumber, toBlock: toBlockNumber };

registryContract.watchDataProductChange(
    watcherConfig,
    logger,
    DataProductTruffleContract,
    (event: any) => {
        dataProductUpdater.updateDataProduct(event.contractAddress);
    }
);

lastBlock.watch(web3, config.lastBlockSaveInterval);

export {};
