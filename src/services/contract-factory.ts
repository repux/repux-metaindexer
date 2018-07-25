import {Contract} from "../utils/contract";

export class ContractFactory {
    protected contract: any;

    /**
     * @param {json} artifacts
     * @param {Object} ethereumProvider web3 provider
     */
    constructor(protected artifacts: any, protected ethereumProvider: any) {
        this.contract = Contract.getInstance(artifacts, ethereumProvider);
    }

    /**
     * @param {string} address
     * @returns {Promise} truffle contract promise
     */
    public at(address: string) {
        return this.contract.at(address);
    }
}

module.exports.ContractFactory = ContractFactory;
