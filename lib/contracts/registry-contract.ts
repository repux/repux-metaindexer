const truffleContract = require('./../utils/truffle-contract');

export class RegistryContract {
    private contract: any;

    /**
     * @param {json} artifacts
     * @param {Object} ethereumProvider web3 provider
     * @param {string} address
     */
    constructor(private artifacts: any, private ethereumProvider: any, private address: String) {
        this.contract = truffleContract.getInstance(artifacts, ethereumProvider);
    }

    /**
     * @param {array} config
     * @param {Object} logger
     * @param {Object} DataProductTruffleContract truffle contract
     * @param {Function} callback truffle contract
     */
    async watchDataProductChange(config: any, logger: any, DataProductTruffleContract: any, callback: Function) {
        let contract = await this.contract.at(this.address);

        contract.CreateDataProduct({}, config).watch(
            async (err: any, res: any) => {
                if (res) {
                    let newDataProductAddress = res.args.dataProduct;
                    let sellerMetaHash = res.args.sellerMetaHash;
                    let newDataProductOwner = '';

                    try {
                        let newDataProductInstance = await DataProductTruffleContract.at(newDataProductAddress);
                        newDataProductOwner = await newDataProductInstance.owner();
                    } catch (e) {
                        logger.error(
                            '[event:CreateDataProduct] %s',
                            {
                                block: res.blockNumber,
                                transactionHash: res.transactionHash,
                                owner: newDataProductOwner,
                                address: newDataProductAddress,
                                ipfsHash: sellerMetaHash,
                                message: e.message
                            }
                        );

                        throw e;
                    }

                    logger.info(
                        '[event:CreateDataProduct] %s',
                        {
                            block: res.blockNumber,
                            transactionHash: res.transactionHash,
                            owner: newDataProductOwner,
                            address: newDataProductAddress,
                            ipfsHash: sellerMetaHash
                        }
                    );

                    callback({
                        contractAddress: newDataProductAddress,
                        sellerMetaHash: sellerMetaHash,
                        transactionHash: res.transactionHash,
                        blockNumber: res.blockNumber
                    });
                }
            }
        );
    }
}

module.exports = RegistryContract;
