const DIST_DIR = './../../dist/';

const mock = require('mock-require');

describe('Service - Registry', function () {

    function mockRegistryContract(properties) {
        return Object.assign({},
            {
                address: '0xaddress',
                version: () => Promise.resolve(1),
                abi: []
            },
            properties
        );
    }

    afterEach(() => {
        mock.stopAll();
    });

    function mockContractFactoryProvider(contracts) {
        return {
            getFactory: jasmine.createSpy('contractFactoryProvider.getFactory').and.callFake((contractName, version) => {
                return {
                    at: () => Promise.resolve(contracts[contractName])
                };
            }),
            getFactoryByAddress: jasmine.createSpy('contractFactoryProvider.getFactory').and.callFake((contractName, address) => {
                return Promise.resolve({
                    at: () => Promise.resolve(contracts[contractName])
                });
            }),
        };
    }

    it('should create watchers for DataProduct changes', async function () {
        const
            logger = {
                error: jasmine.createSpy('logger.error').and.callFake(console.error),
                info: () => {}
            },
            config = { registryAddress: '0xaddress', minRegistryVersion: 1 },
            watcherConfig = { prop: 'val' },
            callback = jasmine.createSpy('callback'),
            registryContract = mockRegistryContract({ address: config.registryAddress }),
            contractFactoryProvider = mockContractFactoryProvider({
                'Versionable': registryContract,
                'Registry': registryContract,
            }),
            event = { address: registryContract.address, topics: ['topic'] },
            watch = jasmine.createSpy('web3.eth.filter.watch').and.callFake((_callback) => {
                _callback(null, event);
            }),
            web3 = {
                eth: {
                    filter: () => ({ watch })
                }
            },
            log = { logProperty: 'value' },
            EthLogsUtils = {
                parseLog: () => log
            };

        mock(DIST_DIR + 'utils/eth-logs-utils', { EthLogsUtils });
        const Registry = mock.reRequire(DIST_DIR + 'services/registry').Registry;

        const service = new Registry(config, web3, contractFactoryProvider, logger);

        await service.watchDataProductChange(watcherConfig, callback);

        expect(watch).toHaveBeenCalledTimes(1);
        expect(logger.error).not.toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(log);
    });
});
