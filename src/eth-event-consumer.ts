import {Logger} from "./utils/logger";
import {DataProductUpdater} from "./services/data-product-updater";
import {RatingsUpdater} from "./services/ratings-updater";
import {DataProductEventHandler} from "./services/data-product-event-handler";
import {WsNotifier} from "./utils/ws-notifier";
import {ContractFactoryProvider} from "./services/contract-factory-provider";

const amqp = require('amqplib');
const Web3 = require('web3');
const config = require('../config/config');
const esClient = require('./elasticsearch/client');

(async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumHost));
    const logger = Logger.init('ETH-EVENT-CONSUMER');

    logger.info('[init]_____ ETH EVENT CONSUMER ______');
    logger.info('[init] Connecting to ethereum: ' + config.ethereumHost);

    const contractFactoryProvider = new ContractFactoryProvider(
        __dirname + '/../contracts',
        web3.currentProvider,
        logger
    );
    const tokenContractFactory = contractFactoryProvider.getFactory(config.tokenContractName);
    const token = await tokenContractFactory.at(config.tokenAddress);

    const dataProductUpdater = new DataProductUpdater(
        esClient,
        config.elasticsearch.indexes.dataProduct,
        config,
        web3,
        logger,
        token,
        contractFactoryProvider
    );

    const ratingsUpdater = new RatingsUpdater(esClient, config, web3, logger);

    const amqpConnection = await amqp.connect(config.amqp.url);
    const channel = await amqpConnection.createChannel();
    const eventsQueueConfig = config.amqp.queues.eth_events;
    await channel.assertQueue(eventsQueueConfig.name, eventsQueueConfig.options);
    channel.prefetch(1);

    const wsNotifier = new WsNotifier(config.socketio, logger);

    const dataProductEventHandler = new DataProductEventHandler(
        esClient,
        config.elasticsearch.indexes.dataProductEvent,
        logger,
        contractFactoryProvider,
        dataProductUpdater,
        ratingsUpdater,
        wsNotifier
    );

    channel.consume(
        eventsQueueConfig.name,
        async (message: any) => {
            try {
                await dataProductEventHandler.handleEnqueuedMessage(message);
            } catch (e) {
                logger.error(e);
            } finally {
                channel.ack(message);
            }
        }
    );
})();
