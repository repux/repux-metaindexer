const DIST_DIR = './../../dist/';

const mock = require('mock-require');

describe('Service - Registry', function () {
    it('should create watchers for DataProduct changes', async function () {
        const
            watch = jasmine.createSpy('DataProductUpdate.watch'),
            registryContract = {
                DataProductUpdate: jasmine.createSpy('registryContract.DataProductUpdate').and.returnValue({ watch })
            },
            registryContractFactory = {
                at: jasmine.createSpy('contract.at').and.returnValue(registryContract)
            },
            dataProductContractFactory = {},
            logger = {},
            config = { prop: 'val' },
            callback = () => {
            };

        const Registry = mock.reRequire(DIST_DIR + 'services/registry').Registry;

        const service = new Registry(registryContractFactory, dataProductContractFactory, logger);

        await service.watchDataProductChange('address', config, callback);

        expect(registryContractFactory.at).toHaveBeenCalledWith('address');
        expect(registryContract.DataProductUpdate).toHaveBeenCalled();
        expect(registryContract.DataProductUpdate.calls.mostRecent().args[1]).toEqual(config);
        expect(watch).toHaveBeenCalledWith(jasmine.any(Function));
    });
});
