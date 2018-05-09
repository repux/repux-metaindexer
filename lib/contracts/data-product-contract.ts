const truffleContract = require('truffle-contract');

export class DataProductContract {

    private contract: any;

    /**
     * @param {json} artifacts
     * @param {Object} ethereumProvider web3 provider
     * @param {string} address
     */
    constructor(private artifacts: any, private ethereumProvider: any, private address: String) {
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

module.exports = DataProductContract;
