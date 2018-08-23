import {ContractFactory} from "./contract-factory";

export const ContractNames = {
    VERSIONABLE: 'Versionable',
    REGISTRY: 'Registry',
    ORDER: 'Order',
    DATA_PRODUCT: 'DataProduct',
};

const fs = require('fs');

export class ContractFactoryProvider {

    protected factories: any = {};

    protected contractsVersions: any = {};

    protected versionableContractsDir: string;

    constructor(private contractsDir: string, private ethereumProvider: any, private logger: any = null) {
        this.contractsDir = contractsDir.replace(/\\+$/, '');
        this.versionableContractsDir = `${contractsDir}/versionable`;
        this.readContracts();
    }

    public getFactory(contractName: string, version: number = null): ContractFactory {
        if (typeof this.factories[contractName] === 'undefined') {
            this.factories[contractName] = {};
        }

        if (typeof this.factories[contractName][version] === 'undefined') {
            let contractPath;

            if (version) {
                contractPath = this.getNearestVersionPath(contractName, version);
            } else {
                contractPath = this.getContractPath(contractName);
            }

            this.factories[contractName][version] = new ContractFactory(require(contractPath), this.ethereumProvider);
        }

        return this.factories[contractName][version];
    }

    public async getFactoryByAddress(contractName: string, address: string) {
        const versionableContractFactory = this.getFactory(ContractNames.VERSIONABLE);
        const versionableContract = await versionableContractFactory.at(address);

        return this.getFactory(contractName, await versionableContract.version());
    }

    protected readContracts() {
        const contractsNames = fs.readdirSync(this.versionableContractsDir);

        contractsNames.forEach((contractName: string) =>
            this.contractsVersions[contractName] = fs.readdirSync(`${this.versionableContractsDir}/${contractName}`)
        );
    }

    protected getContractPath(contractName: string): string {
        return `${this.contractsDir}/${contractName}.json`;
    }

    protected getNearestVersionPath(contractName: string, version: number): string {
        if (typeof this.contractsVersions[contractName] === 'undefined') {
            throw new Error(`Contract not found: ${contractName}`);
        }

        const nearestVersion = this.contractsVersions[contractName].reduce(
            (value: number, availableVersion: number) => {
                if (availableVersion <= version) {
                    return availableVersion;
                }
            },
            0
        );

        if (!nearestVersion) {
            throw new Error(`Version ${version} of contract ${contractName} was not found.`);
        }

        if (this.logger) {
            this.logger.info(`Looked for contract ${contractName}@${version}, found @${nearestVersion}`);
        }

        return `${this.versionableContractsDir}/${contractName}/${nearestVersion}/${contractName}.json`;
    }
}

module.exports.ContractFactoryProvider = ContractFactoryProvider;
