const DIST_DIR = './../../dist/';

const mock = require('mock-require');

describe('Service - Contract factory', function () {
    it('should create a new truffle contract', function () {
        const contract = {};
        const truffleContractModule = {
            getInstance: jasmine.createSpy('truffleContract.getInstance').and.returnValue(contract)
        };
        const artifacts = { prop: 'value' };
        const provider = { prop: 'value' };

        mock(DIST_DIR + 'utils/contract', { Contract: truffleContractModule });
        const ContractFactory = mock.reRequire(DIST_DIR + 'services/contract-factory').ContractFactory;

        new ContractFactory(artifacts, provider);

        expect(truffleContractModule.getInstance).toHaveBeenCalledWith(artifacts, provider);
    });
});
