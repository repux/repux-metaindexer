const contract = require('truffle-contract');

export class TruffleContract {
    /**
     * @param {json} artifacts
     * @param {Object} ethereumProvider web3 provider
     */
    static getInstance(artifacts: any, ethereumProvider: any) {

        let truffleContract = contract(artifacts);
        truffleContract.setProvider(ethereumProvider);

        return truffleContract;
    }
}

module.exports = TruffleContract;
