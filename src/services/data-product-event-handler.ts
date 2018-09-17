import {ContractFactory} from "./contract-factory";
import {DataProductUpdater} from "./data-product-updater";
import {RatingsUpdater} from "./ratings-updater";
import {WsNotifier} from "../utils/ws-notifier";
import {Contract} from "../utils/contract";

export class DataProductEventHandler {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {Object} logger
     * @param {ContractFactory} dataProductContractFactory
     * @param {DataProductUpdater} dataProductUpdater
     * @param {RatingsUpdater} ratingsUpdater
     * @param {WsNotifier} wsNotifier
     * @param {Object} web3
     */
    constructor(
        private esClient: any,
        private esIndexName: string,
        private logger: any,
        private dataProductContractFactory: ContractFactory,
        private dataProductUpdater: DataProductUpdater,
        private ratingsUpdater: RatingsUpdater,
        private wsNotifier: WsNotifier,
        private web3: any
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

    public async handleEnqueuedEvent(event: any) {
        this.logger.info('[blockchain][event] captured:', event);

        const dataProductCode = await this.web3.eth.getCode(event.args.dataProduct);

        if (!Contract.isContractCode(dataProductCode)) {
            throw Error(`No contract at address: ${event.args.dataProduct}`);
        }

        const dataProductContract = await this.dataProductContractFactory.at(event.args.dataProduct);

        await this.dataProductUpdater.handleDataProductUpdate(
            dataProductContract,
            event.blockNumber,
            event.args.action
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
