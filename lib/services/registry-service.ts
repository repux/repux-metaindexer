import {ContractFactory} from "./contract-factory";

export class RegistryService {
    constructor(
        private registryContractFactory: ContractFactory,
        private dataProductContractFactory: ContractFactory,
        private logger: any
    ) {
    }

    public async watchDataProductChange(address: string, config: any, callback: Function) {
        try {
            let contract = await this.registryContractFactory.at(address);
            contract.CreateDataProduct({}, config).watch(
                (err: any, res: any) => {
                    return this.handleDataProductChange(err, res, callback);
                }
            );
        } catch (e) {
            this.logger.error(e);
        }
    }

    private async handleDataProductChange(
        err: any,
        res: any,
        callback: Function
    ) {
        if (res) {
            let address = res.args.dataProduct;
            let sellerMetaHash = res.args.sellerMetaHash;
            let owner, dataProductContract;

            try {
                dataProductContract = await this.dataProductContractFactory.at(address);
                owner = await dataProductContract.owner();
            } catch (e) {
                this.logger.error(
                    '[event:CreateDataProduct] %s',
                    {
                        block: res.blockNumber,
                        transactionHash: res.transactionHash,
                        address,
                        message: e.message
                    }
                );

                throw e;
            }

            this.logger.info(
                '[event:CreateDataProduct] %s',
                {
                    block: res.blockNumber,
                    transactionHash: res.transactionHash,
                    owner,
                    address,
                    sellerMetaHash
                }
            );

            callback({
                contract: dataProductContract
            });
        }
    }
}

module.exports.RegistryService = RegistryService;
