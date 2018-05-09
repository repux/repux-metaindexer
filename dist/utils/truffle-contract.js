"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contract = require('truffle-contract');
class TruffleContract {
    /**
     * @param {json} artifacts
     * @param {Object} ethereumProvider web3 provider
     */
    static getInstance(artifacts, ethereumProvider) {
        let truffleContract = contract(artifacts);
        truffleContract.setProvider(ethereumProvider);
        return truffleContract;
    }
}
exports.TruffleContract = TruffleContract;
module.exports = TruffleContract;
