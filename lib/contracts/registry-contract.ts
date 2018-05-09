const truffleContract = require('truffle-contract');

export class RegistryContract {

    private contract: any;

    /**
     *
     * @param {json} artifacts
     * @param {Object} ethereumProvider web3 provider
     * @param {string} address
     */
    constructor(private artifacts: any, private ethereumProvider: any, private address: String) {
        this.contract = truffleContract.at(address);
    }

    /**
     *
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
                    let ipfsHash = res.args.ipfsHash;
                    let newDataProductOwner = '';
                    try {
                        let newDataProductInstance = await DataProductTruffleContract.at(newDataProductAddress);
                        newDataProductOwner = await newDataProductInstance.owner();
                    } catch (e) {
                        logger.error('[event:CreateDataProduct][block:' + res.blockNumber + '][transactionHash:' + res.transactionHash + '][owner:' + newDataProductOwner + '] address:' + newDataProductAddress + ' ipfsHash: ' + ipfsHash + ' message:' + e.message);
                    }

                    logger.info('[event:CreateDataProduct][block:' + res.blockNumber + '][transactionHash:' + res.transactionHash + '][owner:' + newDataProductOwner + '] address:' + newDataProductAddress + ' ipfsHash: ' + ipfsHash);

                    callback({
                        contractAddress: newDataProductAddress,
                        ipfsHash: ipfsHash,
                        transactionHash: res.transactionHash,
                        blockNumber: res.blockNumber
                    });
                }
            }
        );
    }
}

module.exports = RegistryContract;
