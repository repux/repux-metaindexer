"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const truffleContract = require('truffle-contract');
class DataProductContract {
    /**
     * @param {json} artifacts
     * @param {Object} ethereumProvider web3 provider
     * @param {string} address
     */
    constructor(artifacts, ethereumProvider, address) {
        this.artifacts = artifacts;
        this.ethereumProvider = ethereumProvider;
        this.address = address;
        this.contract = truffleContract(artifacts);
        this.contract.setProvider(ethereumProvider);
    }
    /**
     * @returns {Object} truffle contract
     */
    getContract() {
        return this.contract;
    }
}
exports.DataProductContract = DataProductContract;
module.exports = DataProductContract;
