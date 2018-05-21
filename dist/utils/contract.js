"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TruffleContract = require('truffle-contract');
class Contract {
    /**
     * @param {json} artifacts
     * @param {Object} ethereumProvider web3 provider
     */
    static getInstance(artifacts, ethereumProvider) {
        let truffleContract = TruffleContract(artifacts);
        truffleContract.setProvider(ethereumProvider);
        return truffleContract;
    }
}
exports.Contract = Contract;
module.exports.Contract = Contract;
