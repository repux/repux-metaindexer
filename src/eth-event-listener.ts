import {Registry} from "./services/registry";
import {Logger} from "./utils/logger";
import {LastBlock} from "./utils/last-block";
import {ContractFactoryProvider} from "./services/contract-factory-provider";

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

    const contractFactoryProvider = new ContractFactoryProvider(
        __dirname + '/../contracts',
        web3.currentProvider,
        logger
    );
    const registry = new Registry(config, web3, contractFactoryProvider, logger);

    const amqpConnection = await amqp.connect(config.amqp.url);
    const channel = await amqpConnection.createChannel();
    const eventsQueueConfig = config.amqp.queues.eth_events;
    await channel.assertQueue(eventsQueueConfig.name, eventsQueueConfig.options);

    registry.watchDataProductChange(
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
