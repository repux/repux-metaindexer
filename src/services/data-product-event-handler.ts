import {ContractFactory} from "./contract-factory";
import {DataProductUpdater} from "./data-product-updater";
import {RatingsUpdater} from "./ratings-updater";
import {SocketIoServer} from "../socketio/server";

export class DataProductEventHandler {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {Object} logger
     * @param {ContractFactory} dataProductContractFactory
     * @param {DataProductUpdater} dataProductUpdater
     * @param {RatingsUpdater} ratingsUpdater
     * @param {SocketIoServer} wsServer
     */
    constructor(
        private esClient: any,
        private esIndexName: string,
        private logger: any,
        private dataProductContractFactory: ContractFactory,
        private dataProductUpdater: DataProductUpdater,
        private ratingsUpdater: RatingsUpdater,
        private wsServer: SocketIoServer
    ) {
    }

    public async createEventIfItDoesntExist(event: any) {
        const response = await this.esClient.update(
            {
                index: this.esIndexName,
                type: this.esIndexName,
                id: event.transactionHash,
                body: {
                    doc: event,
                    doc_as_upsert: true,
                },
                refresh: 'wait_for',
            },
        );

        return Promise.resolve(response.result === 'created');
    }

    public async handleEnqueuedMessage(message: any) {
        if (null === message) {
            return;
        }

        const event = JSON.parse(message.content.toString());

        this.logger.info('[EVENT]', event);

        const dataProductContract = await this.dataProductContractFactory.at(event.args.dataProduct);

        await this.dataProductUpdater.handleDataProductUpdate(
            dataProductContract,
            event.blockNumber,
            event.args.action
        );

        await this.ratingsUpdater.recalculateRatingsForUser(await dataProductContract.owner());

        if (await this.createEventIfItDoesntExist(event)) {
            this.logger.info('DataProductEvent created', event.transactionHash);
            this.wsServer.sendDataProductUpdate(event);
        }
    }
}

module.exports.DataProductEventHandler = DataProductEventHandler;
