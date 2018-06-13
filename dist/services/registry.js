"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATA_PRODUCT_UPDATE_ACTION = {
    CREATE: 0,
    UPDATE: 1,
    DELETE: 2,
    PURCHASE: 3,
    APPROVE: 4,
    RATE: 5,
    CANCEL_RATING: 6
};
class Registry {
    constructor(registryContractFactory, dataProductContractFactory, logger) {
        this.registryContractFactory = registryContractFactory;
        this.dataProductContractFactory = dataProductContractFactory;
        this.logger = logger;
    }
    async watchDataProductChange(address, config, callback) {
        try {
            let contract = await this.registryContractFactory.at(address);
            contract.DataProductUpdate({}, config).watch((err, res) => {
                return this.handleDataProductChange(err, res, callback);
            });
        }
        catch (e) {
            this.logger.error(e);
        }
    }
    async handleDataProductChange(err, res, callback) {
        if (err) {
            this.logger.error(err);
        }
        if (res) {
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
            callback({
                contract: dataProductContract,
                blockNumber: res.blockNumber,
                action: action
            });
        }
    }
}
exports.Registry = Registry;
module.exports.RegistryService = Registry;
