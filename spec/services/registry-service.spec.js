const DIST_DIR = './../../dist/';

const mock = require('mock-require');

describe('Registry service', function () {
    it('should create watchers for DataProduct changes', async function () {
        const
            watch = jasmine.createSpy('CreateDataProduct.watch'),
            registryContract = {
                CreateDataProduct: jasmine.createSpy('registryContract.CreateDataProduct').and.returnValue({ watch })
            },
            registryContractFactory = {
                at: jasmine.createSpy('contract.at').and.returnValue(registryContract)
            },
            dataProductContractFactory = {},
            logger = {},
            config = { prop: 'val' },
            callback = () => {
            };

        const RegistryService = mock.reRequire(DIST_DIR + 'services/registry-service').RegistryService;

        const service = new RegistryService(registryContractFactory, dataProductContractFactory, logger);

        await service.watchDataProductChange('address', config, callback);

        expect(registryContractFactory.at).toHaveBeenCalledWith('address');
        expect(registryContract.CreateDataProduct).toHaveBeenCalled();
        expect(registryContract.CreateDataProduct.calls.mostRecent().args[1]).toEqual(config);
        expect(watch).toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('should call callback function on CreateDataProduct event', async function () {
        const
            watch = jasmine.createSpy('CreateDataProduct.watch'),
            registryContract = {
                CreateDataProduct: jasmine.createSpy('registryContract.CreateDataProduct').and.returnValue({ watch })
            },
            registryContractFactory = {
                at: jasmine.createSpy('contract.at').and.returnValue(registryContract)
            },
            dataProductContractFactory = {},
            logger = {},
            config = { prop: 'val' },
            callback = () => {
            };

        const RegistryService = mock.reRequire(DIST_DIR + 'services/registry-service').RegistryService;

        const service = new RegistryService(registryContractFactory, dataProductContractFactory, logger);

        await service.watchDataProductChange('address', config, callback);

        expect(registryContractFactory.at).toHaveBeenCalledWith('address');
        expect(registryContract.CreateDataProduct).toHaveBeenCalled();
        expect(registryContract.CreateDataProduct.calls.mostRecent().args[1]).toEqual(config);
        expect(watch).toHaveBeenCalledWith(jasmine.any(Function));
    });
});
