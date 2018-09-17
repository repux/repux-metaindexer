import {ContractFactory} from "./services/contract-factory";
import {Logger} from "./utils/logger";
import {DataProductUpdater} from "./services/data-product-updater";
import {RatingsUpdater} from "./services/ratings-updater";
import {DataProductEventHandler} from "./services/data-product-event-handler";
import {WsNotifier} from "./utils/ws-notifier";

const amqp = require('amqplib');
const Web3 = require('web3');
const config = require('../config/config');
const esClient = require('./elasticsearch/client');

(async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumHost));
    const logger = Logger.init('ETH-EVENT-CONSUMER');

    logger.info('[init]_____ ETH EVENT CONSUMER ______');
    logger.info('[init] Connecting to ethereum: ' + config.ethereumHost);

    const dataProductContractFactory = new ContractFactory(require('../contracts/DataProduct.json'), web3.currentProvider);
    const tokenContractFactory = new ContractFactory(
        require(`../contracts/${config.tokenContractName}.json`),
        web3.currentProvider
    );
    const orderContractFactory = new ContractFactory(require('../contracts/Order.json'), web3.currentProvider);

    const token = await tokenContractFactory.at(config.tokenAddress);

    const dataProductUpdater = new DataProductUpdater(
        esClient,
        config.elasticsearch.indexes.dataProduct,
        config,
        web3,
        logger,
        token,
        orderContractFactory
    );

    const ratingsUpdater = new RatingsUpdater(esClient, config, web3, logger);

    const amqpConnection = await amqp.connect(config.amqp.url);
    const channel = await amqpConnection.createChannel();
    const eventsQueueConfig = config.amqp.queues.eth_events;
    const forRetryEventsQueueConfig = config.amqp.queues.eth_events_for_retry;
    const failedEventsQueueConfig = config.amqp.queues.eth_events_failed;

    await channel.assertQueue(eventsQueueConfig.name, eventsQueueConfig.options);
    await channel.assertQueue(forRetryEventsQueueConfig.name, forRetryEventsQueueConfig.options);
    await channel.assertQueue(failedEventsQueueConfig.name, failedEventsQueueConfig.options);

    channel.prefetch(1);

    const wsNotifier = new WsNotifier(config.socketio, logger);

    const dataProductEventHandler = new DataProductEventHandler(
        esClient,
        config.elasticsearch.indexes.dataProductEvent,
        logger,
        dataProductContractFactory,
        dataProductUpdater,
        ratingsUpdater,
        wsNotifier,
        web3
    );

    channel.consume(
        eventsQueueConfig.name,
        async (message: any) => {
            if (null === message) {
                return;
            }

            const eventData = JSON.parse(message.content.toString());

            try {
                await dataProductEventHandler.handleEnqueuedEvent(eventData.event);
            } catch (e) {
                logger.error(e);

                if (eventData.tries < config.amqp.maxNumberOfTries) {
                    eventData.tries++;

                    logger.error(`Event processing failed. Postponing (#${eventData.tries}).`);

                    await channel.sendToQueue(
                        forRetryEventsQueueConfig.name,
                        Buffer.from(JSON.stringify(eventData)),
                        forRetryEventsQueueConfig.message_options
                    );
                } else {
                    logger.error(`Maximum number of tries (${config.amqp.maxNumberOfTries}) for processing an event has been reached.`);

                    await channel.sendToQueue(failedEventsQueueConfig.name, Buffer.from(JSON.stringify(eventData)));
                }
            } finally {
                channel.ack(message);
            }
        }
    );
})();
