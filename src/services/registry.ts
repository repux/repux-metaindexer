import {ContractFactory} from "./contract-factory";

export enum DATA_PRODUCT_UPDATE_ACTION {
    CREATE,
    UPDATE,
    DELETE,
    PURCHASE,
    CANCEL_PURCHASE,
    FINALISE,
    RATE,
    CANCEL_RATING
}

export class Registry {
    private eventsQueue: Array<Function> = [];
    private eventsQueueIsProcessing = false;

    constructor(
        private registryContractFactory: ContractFactory,
        private dataProductContractFactory: ContractFactory,
        private logger: any
    ) {
    }

    public async watchDataProductChange(address: string, config: any, callback: Function) {
        try {
            let contract = await this.registryContractFactory.at(address);
            contract.DataProductUpdate({}, config).watch(
                (err: any, res: any) => {
                    this.enqueueEventHandler(() => this.handleDataProductChange(err, res, callback));
                    this.processEvents();
                }
            );
        } catch (e) {
            this.logger.error(e);
        }
    }

    private async processEvents() {
        if (this.eventsQueueIsProcessing) {
            return;
        }

        this.eventsQueueIsProcessing = true;

        try {
            while (this.eventsQueue.length) {
                await this.eventsQueue.shift()();
            }
        } catch (e) {
            throw e;
        } finally {
            this.eventsQueueIsProcessing = false;
        }
    }

    private enqueueEventHandler(handler: Function) {
        this.eventsQueue.push(handler);
    }

    private async handleDataProductChange(err: any, res: any, callback: Function) {
        if (err) {
            this.logger.error(err);
        }

        if (!res) {
            return;
        }

        this.logger.info('[EVENT][DataProductUpdate] %s', res);

        await callback(res);
    }
}

module.exports.RegistryService = Registry;
