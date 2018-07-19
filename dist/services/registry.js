"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DATA_PRODUCT_UPDATE_ACTION;
(function (DATA_PRODUCT_UPDATE_ACTION) {
    DATA_PRODUCT_UPDATE_ACTION[DATA_PRODUCT_UPDATE_ACTION["CREATE"] = 0] = "CREATE";
    DATA_PRODUCT_UPDATE_ACTION[DATA_PRODUCT_UPDATE_ACTION["UPDATE"] = 1] = "UPDATE";
    DATA_PRODUCT_UPDATE_ACTION[DATA_PRODUCT_UPDATE_ACTION["DELETE"] = 2] = "DELETE";
    DATA_PRODUCT_UPDATE_ACTION[DATA_PRODUCT_UPDATE_ACTION["PURCHASE"] = 3] = "PURCHASE";
    DATA_PRODUCT_UPDATE_ACTION[DATA_PRODUCT_UPDATE_ACTION["CANCEL_PURCHASE"] = 4] = "CANCEL_PURCHASE";
    DATA_PRODUCT_UPDATE_ACTION[DATA_PRODUCT_UPDATE_ACTION["FINALISE"] = 5] = "FINALISE";
    DATA_PRODUCT_UPDATE_ACTION[DATA_PRODUCT_UPDATE_ACTION["RATE"] = 6] = "RATE";
    DATA_PRODUCT_UPDATE_ACTION[DATA_PRODUCT_UPDATE_ACTION["CANCEL_RATING"] = 7] = "CANCEL_RATING";
})(DATA_PRODUCT_UPDATE_ACTION = exports.DATA_PRODUCT_UPDATE_ACTION || (exports.DATA_PRODUCT_UPDATE_ACTION = {}));
class Registry {
    constructor(registryContractFactory, dataProductContractFactory, logger) {
        this.registryContractFactory = registryContractFactory;
        this.dataProductContractFactory = dataProductContractFactory;
        this.logger = logger;
        this.eventsQueue = [];
        this.eventsQueueIsProcessing = false;
    }
    async watchDataProductChange(address, config, callback) {
        try {
            let contract = await this.registryContractFactory.at(address);
            contract.DataProductUpdate({}, config).watch((err, res) => {
                this.enqueueEventHandler(() => this.handleDataProductChange(err, res, callback));
                this.processEvents();
            });
        }
        catch (e) {
            this.logger.error(e);
        }
    }
    async processEvents() {
        if (this.eventsQueueIsProcessing) {
            return;
        }
        this.eventsQueueIsProcessing = true;
        try {
            while (this.eventsQueue.length) {
                await this.eventsQueue.shift()();
            }
        }
        catch (e) {
            throw e;
        }
        finally {
            this.eventsQueueIsProcessing = false;
        }
    }
    enqueueEventHandler(handler) {
        this.eventsQueue.push(handler);
    }
    async handleDataProductChange(err, res, callback) {
        if (err) {
            this.logger.error(err);
        }
        if (!res) {
            return;
        }
        const address = res.args.dataProduct;
        const action = res.args.action;
        let owner, dataProductContract;
        try {
            dataProductContract = await this.dataProductContractFactory.at(address);
            owner = await dataProductContract.owner();
        }
        catch (e) {
            this.logger.error('[event:DataProductUpdate] %s', {
                block: res.blockNumber,
                transactionHash: res.transactionHash,
                address,
                message: e.message
            });
            throw e;
        }
        this.logger.info('[event:DataProductUpdate] %s', {
            block: res.blockNumber,
            transactionHash: res.transactionHash,
            owner,
            address,
            action
        });
        await callback({
            contract: dataProductContract,
            blockNumber: res.blockNumber,
            action: action,
            res: res
        });
    }
}
exports.Registry = Registry;
module.exports.RegistryService = Registry;
