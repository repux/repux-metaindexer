const TruffleContract = require('truffle-contract');

export class Contract {
    /**
     * @param {json} artifacts
     * @param {Object} ethereumProvider web3 provider
     */
    static getInstance(artifacts: any, ethereumProvider: any) {
        let truffleContract = TruffleContract(artifacts);
        truffleContract.setProvider(ethereumProvider);

        return truffleContract;
    }
}

module.exports.Contract = Contract;
