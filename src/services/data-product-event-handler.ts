import {DataProductUpdater} from "./data-product-updater";
import {RatingsUpdater} from "./ratings-updater";
import {ContractFactoryProvider, ContractNames} from "./contract-factory-provider";
import {WsNotifier} from "../utils/ws-notifier";

export class DataProductEventHandler {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {Object} logger
     * @param {ContractFactoryProvider} contractFactoryProvider
     * @param {DataProductUpdater} dataProductUpdater
     * @param {RatingsUpdater} ratingsUpdater
     * @param {WsNotifier} wsNotifier
     */
    constructor(
        private esClient: any,
        private esIndexName: string,
        private logger: any,
        private contractFactoryProvider: ContractFactoryProvider,
        private dataProductUpdater: DataProductUpdater,
        private ratingsUpdater: RatingsUpdater,
        private wsNotifier: WsNotifier
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

        this.logger.info('[blockchain][event] captured:', event);

        const dataProductContractFactory = await this.contractFactoryProvider.getFactoryByAddress(
            ContractNames.DATA_PRODUCT,
            event.args.dataProduct
        );
        const dataProductContract = await dataProductContractFactory.at(event.args.dataProduct);

        await this.dataProductUpdater.handleDataProductUpdate(
            dataProductContract,
            event.blockNumber,
            event.args.action,
            event.address
        );

        await this.ratingsUpdater.recalculateRatingsForUser(await dataProductContract.owner());

        if (await this.createEventIfItDoesntExist(event)) {
            this.logger.info('[ws-server][event] DataProductEvent send to ws: ', event.transactionHash);
            try {
              this.wsNotifier.notify(event);
            }
            catch (e) {
              this.logger.error('[ws-server][event] Request failed', e);
            }
        }
    }
}

module.exports.DataProductEventHandler = DataProductEventHandler;
