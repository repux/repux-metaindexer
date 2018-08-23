import {AbiUtils} from "../utils/abi-utils";
import {EthLogsUtils} from "../utils/eth-logs-utils";
import {ContractFactoryProvider, ContractNames} from "./contract-factory-provider";

type AssocArray = {
    [key: string]: any;
}

export enum DATA_PRODUCT_UPDATE_ACTION {
    CREATE,
    UPDATE,
    DELETE,
    PURCHASE,
    CANCEL_PURCHASE,
    FINALISE,
    RATE,
    CANCEL_RATING
}

export class Registry {
    private eventsQueue: Array<Function> = [];
    private eventsQueueIsProcessing = false;

    constructor(
        private config: any,
        private web3: any,
        private contractFactoryProvider: ContractFactoryProvider,
        private logger: any
    ) {
    }

    public async watchDataProductChange(config: any, callback: Function) {
        const registries = await this.getRegistryContracts(
            // TODO: fetch registry addresses from registry proxy
            [this.config.registryAddress],
            this.config.minRegistryVersion
        );
        const decoders: AssocArray = {};

        Object.entries(registries).forEach(([address, contract]) => {
            decoders[address] = AbiUtils.getEventsDecoders(contract.abi);
        });

        this.web3.eth.filter(config).watch(
            (err: any, res: any) => {
                if (err || !res) {
                    throw new Error(err);
                }

                if (typeof registries[res.address] === 'undefined') {
                    return;
                }
                try {
                    const registry = registries[res.address];
                    const event = EthLogsUtils.parseLog(res, decoders[registry.address]);

                    if (event) {
                        this.enqueueEventHandler(() => this.handleDataProductChange(event, callback));
                        this.processEvents();
                    }
                } catch (e) {
                    this.logger.error(e);
                }
            }
        );
    }

    public async getRegistryContracts(addresses: Array<string>, minVersion: number) {
        let contracts: AssocArray = {};
        const versionableContractFactory = this.contractFactoryProvider.getFactory(ContractNames.VERSIONABLE);

        while (addresses.length) {
            const address = addresses.shift();
            let contract;
            let contractVersion = -1;

            try {
                contract = await versionableContractFactory.at(address);
                contractVersion = await contract.version();
            } catch (e) {
                throw new Error(`An error occurred while reading registry at ${address} (${e})`);
            }

            if (contractVersion >= minVersion) {
                contracts[address] = await (this.contractFactoryProvider.getFactory(ContractNames.REGISTRY, contractVersion).at(address));
            }
        }

        return contracts;
    }

    private async processEvents() {
        if (this.eventsQueueIsProcessing) {
            return;
        }

        this.eventsQueueIsProcessing = true;

        try {
            while (this.eventsQueue.length) {
                await this.eventsQueue.shift()();
            }
        } catch (e) {
            throw e;
        } finally {
            this.eventsQueueIsProcessing = false;
        }
    }

    private enqueueEventHandler(handler: Function) {
        this.eventsQueue.push(handler);
    }

    private handleDataProductChange(event: any, callback: Function) {
        this.logger.info('[EVENT][DataProductUpdate] %s', event);

        return callback(event);
    }
}

module.exports.RegistryService = Registry;
