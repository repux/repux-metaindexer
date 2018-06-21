"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contract_1 = require("../utils/contract");
class ContractFactory {
    /**
     * @param {json} artifacts
     * @param {Object} ethereumProvider web3 provider
     */
    constructor(artifacts, ethereumProvider) {
        this.artifacts = artifacts;
        this.ethereumProvider = ethereumProvider;
        this.contract = contract_1.Contract.getInstance(artifacts, ethereumProvider);
    }
    /**
     * @param {string} address
     * @returns {Promise} truffle contract promise
     */
    at(address) {
        return this.contract.at(address);
    }
}
exports.ContractFactory = ContractFactory;
module.exports.ContractFactory = ContractFactory;
