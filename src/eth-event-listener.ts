import {Registry} from "./services/registry";
import {ContractFactory} from "./services/contract-factory";
import {Logger} from "./utils/logger";
import {LastBlock} from "./utils/last-block";

const amqp = require('amqplib');
const path = require('path');
const Web3 = require('web3');
const config = require('../config/config');

(async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumHost));
    const logger = Logger.init('ETH-EVENT-LISTENER');

    const lastBlockFilepath = path.join(__dirname, '../', 'logs', 'lastReadBlock.dat');
    const lastBlock = new LastBlock(config.minimumStartBlock, lastBlockFilepath);
    const startBlockNumber = lastBlock.read();
    const toBlockNumber = 'latest';

    const watcherConfig = {fromBlock: startBlockNumber, toBlock: toBlockNumber};

    logger.info('[init] _____ ETH EVENT LISTENER ______');
    logger.info('[init] Registry address set to: ' + config.registryAddress);
    logger.info('[init] Connecting to ethereum: ' + config.ethereumHost);
    logger.info('[init] Current block:' + web3.eth.blockNumber + '. Start block:' + startBlockNumber + ' to block:' + toBlockNumber);

    const registryContractFactory = new ContractFactory(require('../contracts/Registry.json'), web3.currentProvider);
    const dataProductContractFactory = new ContractFactory(require('../contracts/DataProduct.json'), web3.currentProvider);
    const registry = new Registry(registryContractFactory, dataProductContractFactory, logger);

    const amqpConnection = await amqp.connect(config.amqp.url);
    const channel = await amqpConnection.createChannel();
    const eventsQueueConfig = config.amqp.queues.eth_events;
    await channel.assertQueue(eventsQueueConfig.name, eventsQueueConfig.options);

    registry.watchDataProductChange(
        config.registryAddress,
        watcherConfig,
        async (event: any) => {
            await channel.sendToQueue(
                eventsQueueConfig.name,
                Buffer.from(JSON.stringify(event))
            );
            lastBlock.write(event.blockNumber);
        }
    );
})();
