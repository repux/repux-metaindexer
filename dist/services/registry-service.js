"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RegistryService {
    constructor(registryContractFactory, dataProductContractFactory, logger) {
        this.registryContractFactory = registryContractFactory;
        this.dataProductContractFactory = dataProductContractFactory;
        this.logger = logger;
    }
    async watchDataProductChange(address, config, callback) {
        try {
            let contract = await this.registryContractFactory.at(address);
            contract.CreateDataProduct({}, config).watch((err, res) => {
                return this.handleDataProductChange(err, res, callback);
            });
        }
        catch (e) {
            this.logger.error(e);
        }
    }
    async handleDataProductChange(err, res, callback) {
        if (res) {
            let address = res.args.dataProduct;
            let sellerMetaHash = res.args.sellerMetaHash;
            let owner, dataProductContract;
            try {
                dataProductContract = await this.dataProductContractFactory.at(address);
                owner = await dataProductContract.owner();
            }
            catch (e) {
                this.logger.error('[event:CreateDataProduct] %s', {
                    block: res.blockNumber,
                    transactionHash: res.transactionHash,
                    address,
                    message: e.message
                });
                throw e;
            }
            this.logger.info('[event:CreateDataProduct] %s', {
                block: res.blockNumber,
                transactionHash: res.transactionHash,
                owner,
                address,
                sellerMetaHash
            });
            callback({
                contract: dataProductContract
            });
        }
    }
}
exports.RegistryService = RegistryService;
module.exports.RegistryService = RegistryService;
