import {Registry} from "./services/registry";
import {ContractFactory} from "./services/contract-factory";
import {Logger} from "./utils/logger";
import {LastBlock} from "./utils/last-block";
import {DataProductUpdater} from "./services/data-product-updater";
import {SocketIoServer} from "./socketio/server";
import {RatingsUpdater} from "./services/ratings-updater";

const path = require('path');
const Web3 = require('web3');
const config = require('../config/config');
const esClient = require('./elasticsearch/client');

(async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumHost));
    const ethLogger = Logger.init('ETH-LISTENER');
    const wsLogger = Logger.init('WS-SERVER');

    const lastBlockFilepath = path.join(__dirname, '../', 'data', 'lastReadBlock.dat');
    const lastBlock = new LastBlock(config.startBlock, lastBlockFilepath);
    const startBlockNumber = lastBlock.read();
    const toBlockNumber = 'latest';

    const watcherConfig = {fromBlock: Math.max(0, startBlockNumber - 1), toBlock: toBlockNumber};

    ethLogger.info('_____ RESTART ______');
    ethLogger.info('[1] Registry address set to: ' + config.registryAddress);
    ethLogger.info('[2] Connecting to: ' + config.ethereumHost);
    ethLogger.info('[3] Current block:' + web3.eth.blockNumber + '. Start block:' + startBlockNumber + ' to block:' + toBlockNumber);

    const registryContractFactory = new ContractFactory(require('../contracts/Registry.json'), web3.currentProvider);
    const dataProductContractFactory = new ContractFactory(require('../contracts/DataProduct.json'), web3.currentProvider);
    const tokenContractFactory = new ContractFactory(
        require(`../contracts/${config.tokenContractName}.json`),
        web3.currentProvider
    );
    const orderContractFactory = new ContractFactory(require('../contracts/Order.json'), web3.currentProvider);

    const registry = new Registry(registryContractFactory, dataProductContractFactory, ethLogger);
    const token = await tokenContractFactory.at(config.tokenAddress);

    const dataProductUpdater = new DataProductUpdater(
        esClient,
        config.elasticsearch.indexes.dataProduct,
        config,
        web3,
        ethLogger,
        token,
        orderContractFactory
    );

    const ratingsUpdater = new RatingsUpdater(esClient, config, web3, ethLogger);

    const wsServer = new SocketIoServer(
        config.socketio.host,
        parseInt(config.socketio.port),
        config.socketio.path,
        config.socketio.serveClient,
        wsLogger,
        config.socketio.ssl
    );

    registry.watchDataProductChange(
        config.registryAddress,
        watcherConfig,
        async (event: any) => {
            try {
                await dataProductUpdater.handleDataProductUpdate(event.contract, event.blockNumber, event.action);
                await ratingsUpdater.recalculateRatingsForUser(await event.contract.owner());
                esClient.update(
                    {
                        index: config.elasticsearch.indexes.dataProductEvent,
                        type: 'data_product_event',
                        id: event.res.transactionHash,
                        body: {
                            doc: event.res,
                            doc_as_upsert: true,
                        },
                        refresh: 'wait_for',
                    },
                );
                wsServer.sendDataProductUpdate(event.res);
            } catch (e) {
                ethLogger.error(e);
            }
        }
    );

    lastBlock.watch(web3, config.lastBlockSaveInterval);
})();
