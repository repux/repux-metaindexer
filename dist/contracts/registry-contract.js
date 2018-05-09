"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const truffleContract = require('truffle-contract');
class RegistryContract {
    /**
     *
     * @param {json} artifacts
     * @param {Object} ethereumProvider web3 provider
     * @param {string} address
     */
    constructor(artifacts, ethereumProvider, address) {
        this.artifacts = artifacts;
        this.ethereumProvider = ethereumProvider;
        this.address = address;
        this.contract = truffleContract.at(address);
    }
    /**
     *
     * @param {array} config
     * @param {Object} logger
     * @param {Object} DataProductTruffleContract truffle contract
     * @param {Function} callback truffle contract
     */
    async watchDataProductChange(config, logger, DataProductTruffleContract, callback) {
        let contract = await this.contract.at(this.address);
        contract.CreateDataProduct({}, config).watch(async (err, res) => {
            if (res) {
                let newDataProductAddress = res.args.dataProduct;
                let ipfsHash = res.args.ipfsHash;
                let newDataProductOwner = '';
                try {
                    let newDataProductInstance = await DataProductTruffleContract.at(newDataProductAddress);
                    newDataProductOwner = await newDataProductInstance.owner();
                }
                catch (e) {
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
        });
    }
}
exports.RegistryContract = RegistryContract;
module.exports = RegistryContract;
