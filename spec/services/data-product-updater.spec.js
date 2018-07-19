const DIST_DIR = './../../dist/';

const DATA_PRODUCT_UPDATE_ACTION = require(DIST_DIR + 'services/registry').DATA_PRODUCT_UPDATE_ACTION;
const BigNumber = require('bignumber.js');
const mock = require('mock-require');

describe('Service - DataProductUpdater', function() {

    const VALID_METADATA = {
        category: ['Industrial'],
        fullDescription: 'fullDescription',
        maxNumberOfDownloads: 20,
        name: 'name',
        shortDescription: 'shortDescription',
        size: 1500,
        title: 'title',
        type: 'type',
        daysForDeliver: 7,
        eula: {
            type: 'STANDARD',
            fileHash: 'hash'
        }
    };

    afterEach(function () {
        mock.stopAll();
    });

    it('should update product data in ES', async () => {
        const size = { DataSize: 101 };
        const esClient = { update: jasmine.createSpy('es.update') };
        const dataProductContract = {
            sellerMetaHash: () => 'hash',
            owner: () => 'ownerAddress',
            address: 'address',
            price: () => 10,
            getBuyersAddresses: () => [],
            buyersDeposit: () => new BigNumber(0),
            daysForDeliver: () => 7,
            disabled: () => false
        };
        const tokenContract = { balanceOf: () => new BigNumber(0) };
        const ipfsConfig = { httpUrl: 'host' };
        const requestPromise = {
            get: jasmine.createSpy('requestPromise.get').and.returnValues(
                JSON.stringify(size),
                JSON.stringify(VALID_METADATA)
            )
        };
        const logger = { info: () => {}, error: jasmine.createSpy('logger.error') };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };

        mock('request-promise', requestPromise);

        const DataProductUpdater = mock.reRequire(DIST_DIR + 'services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', ipfsConfig, web3, logger, tokenContract);

        await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.UPDATE);

        expect(requestPromise.get).toHaveBeenCalledWith('host/api/v0/object/stat/hash');
        expect(requestPromise.get).toHaveBeenCalledWith('host/ipfs/hash');
        expect(esClient.update.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
            index: 'test',
            type: 'data_product',
            id: 'address',
            body: {
                doc: {
                    address: 'address',
                    ownerAddress: 'ownerAddress',
                    sellerMetaHash: 'hash',
                    lastUpdateTimestamp: block.timestamp,
                    title: VALID_METADATA.title,
                    shortDescription: VALID_METADATA.shortDescription,
                    fullDescription: VALID_METADATA.fullDescription,
                    type: VALID_METADATA.type,
                    category: VALID_METADATA.category,
                    maxNumberOfDownloads: VALID_METADATA.maxNumberOfDownloads,
                    price: '10',
                    termsOfUseType: undefined,
                    name: VALID_METADATA.name,
                    size: VALID_METADATA.size,
                    buyersDeposit: '0',
                    funds: '0',
                    fundsToWithdraw: '0',
                    daysForDeliver: '7',
                    disabled: false,
                    transactions: [],
                    eula: {
                        type: 'STANDARD',
                        fileHash: 'hash'
                    }
                },
                doc_as_upsert : true
            }
        }));
    });

    it('should update product data in ES with meta data', async () => {
        const size = { DataSize: 101 };
        const esClient = { update: jasmine.createSpy('es.update') };
        const dataProductContract = {
            sellerMetaHash: () => 'hash',
            owner: () => 'ownerAddress',
            address: 'address',
            price: () => 10,
            getBuyersAddresses: () => [],
            buyersDeposit: () => new BigNumber(0),
            daysForDeliver: () => 7,
            disabled: () => false
        };
        const tokenContract = { balanceOf: () => new BigNumber(0) };
        const ipfsConfig = { httpUrl: 'host' };
        const requestPromise = {
            get: jasmine.createSpy('requestPromise.get').and.returnValues(
                JSON.stringify(size),
                JSON.stringify(VALID_METADATA)
            )
        };
        const logger = { info: () => {}, error: jasmine.createSpy('logger.error') };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };

        mock('request-promise', requestPromise);

        const DataProductUpdater = mock.reRequire(DIST_DIR + 'services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', ipfsConfig, web3, logger, tokenContract);

        await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.UPDATE);

        expect(requestPromise.get).toHaveBeenCalledWith('host/api/v0/object/stat/hash');
        expect(requestPromise.get).toHaveBeenCalledWith('host/ipfs/hash');
        expect(esClient.update.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
            index: 'test',
            type: 'data_product',
            id: 'address',
            body: {
                doc: {
                    address: 'address',
                    ownerAddress: 'ownerAddress',
                    sellerMetaHash: 'hash',
                    lastUpdateTimestamp: block.timestamp,
                    title: VALID_METADATA.title,
                    shortDescription: VALID_METADATA.shortDescription,
                    fullDescription: VALID_METADATA.fullDescription,
                    type: VALID_METADATA.type,
                    category: VALID_METADATA.category,
                    maxNumberOfDownloads: VALID_METADATA.maxNumberOfDownloads,
                    price: '10',
                    termsOfUseType: undefined,
                    name: VALID_METADATA.name,
                    size: VALID_METADATA.size,
                    buyersDeposit: '0',
                    funds: '0',
                    fundsToWithdraw: '0',
                    daysForDeliver: '7',
                    disabled: false,
                    transactions: [],
                    eula: {
                        type: 'STANDARD',
                        fileHash: 'hash'
                    }
                },
                doc_as_upsert : true
            }
        }));
    });

    it('should ignore errors while updating product', async () => {
        const esClient = { update: jasmine.createSpy('es.update') };
        const dataProductContract = {
            sellerMetaHash: () => 'hash',
            owner: () => 'ownerAddress',
            address: 'address',
            price: () => 10,
            buyersDeposit: () => new BigNumber(0),
            daysForDeliver: () => 7,
            disabled: () => false
        };
        const tokenContract = { balanceOf: () => new BigNumber(0) };
        const ipfsConfig = { httpUrl: 'host' };
        const requestPromise = {
            get: jasmine.createSpy('requestPromise.get').and.throwError('request error')
        };
        const logger = { info: () => {} };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };

        mock('request-promise', requestPromise);

        const DataProductUpdater = mock.reRequire(DIST_DIR + 'services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', ipfsConfig, web3, logger, tokenContract);

        try {
            await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.UPDATE);
            expect(true).toBe(false);
        }
        catch (e) {
        }

        expect(requestPromise.get).toHaveBeenCalledTimes(1);
        expect(requestPromise.get).toHaveBeenCalledWith('host/api/v0/object/stat/hash');
        expect(esClient.update).not.toHaveBeenCalled();
    });

    it('should delete data product on delete action', async () => {
        const esClient = { 'delete': jasmine.createSpy('es.delete') };
        const dataProductContract = { address: 'address' };
        const tokenContract = { balanceOf: () => new BigNumber(0) };
        const ipfsConfig = { httpUrl: 'host' };
        const logger = { info: () => {} };
        const web3 = {};

        const DataProductUpdater = mock.reRequire(DIST_DIR + 'services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', ipfsConfig, web3, logger, tokenContract);

        await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.DELETE);

        expect(esClient.delete).toHaveBeenCalledTimes(1);
        expect(esClient.delete.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
            index: 'test',
            type: 'data_product',
            id: 'address'
        }));
    });

    it('should check meta file size', async () => {
        const size = { DataSize: 101 };
        const esClient = {};
        const dataProductContract = {
            sellerMetaHash: () => 'hash',
            owner: () => 'ownerAddress',
            address: 'address',
            price: () => 10,
            buyersDeposit: () => new BigNumber(0),
            daysForDeliver: () => 7,
            disabled: () => false
        };
        const tokenContract = { balanceOf: () => new BigNumber(0) };
        const ipfsConfig = { httpUrl: 'host', maxMetaFileSize: 100 };
        const requestPromise = {
            get: jasmine.createSpy('requestPromise.get').and.returnValues(JSON.stringify(size), '{}')
        };
        const logger = { info: () => {}, error: jasmine.createSpy('logger.error') };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };

        mock('request-promise', requestPromise);

        const DataProductUpdater = mock.reRequire(DIST_DIR + 'services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', ipfsConfig, web3, logger, tokenContract);

        try {
            await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.CREATE);
            expect(false).toBe(true);
        } catch (e) {
            expect(e.message).toContain('Meta file size is too large');
        }
    });

    it('should validate meta data', async () => {
        const size = { DataSize: 100 };
        const esClient = { update: () => {} };
        const dataProductContract = {
            sellerMetaHash: () => 'hash',
            owner: () => 'ownerAddress',
            address: 'address',
            price: () => 10,
            getBuyersAddresses: () => [],
            buyersDeposit: () => new BigNumber(0),
            daysForDeliver: () => 7,
            disabled: () => false
        };
        const tokenContract = { balanceOf: () => new BigNumber(0) };
        const ipfsConfig = { httpUrl: 'host', maxMetaFileSize: 100 };
        const requestPromise = {
            get: jasmine.createSpy('requestPromise.get').and.returnValues(JSON.stringify(size), '{}')
        };
        const logger = { info: () => {}, error: jasmine.createSpy('logger.error') };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };
        const categories = { pathExists: jasmine.createSpy('categories.pathExists') };

        mock('request-promise', requestPromise);
        mock(DIST_DIR + 'utils/categories', { Categories: categories });

        const DataProductUpdater = mock.reRequire(DIST_DIR + 'services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', ipfsConfig, web3, logger, tokenContract);

        let metaData = {};
        Object.assign(metaData, VALID_METADATA);

        // category validation

        metaData.category = ['1', '2'];

        requestPromise.get.and.returnValues(JSON.stringify(size), JSON.stringify(metaData));
        categories.pathExists.and.returnValue(false);

        try {
            await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.CREATE);
            expect(false).toBe(true);
        } catch (e) {
            expect(e.message).toContain('Category does not exist');
            expect(categories.pathExists).toHaveBeenCalledTimes(1);
        }

        metaData.category = ['1', '2', '3 > 4'];
        categories.pathExists.calls.reset();
        requestPromise.get.and.returnValues(JSON.stringify(size), JSON.stringify(metaData));
        categories.pathExists.and.returnValue(true);

        await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.CREATE);

        expect(categories.pathExists).toHaveBeenCalledTimes(3);

        // eula validation

        Object.assign(metaData, VALID_METADATA);
        metaData.eula = { type: 'INVALID', fileHash: 'hash' };

        requestPromise.get.and.returnValues(JSON.stringify(size), JSON.stringify(metaData));

        try {
            await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.CREATE);
            expect(false).toBe(true);
        } catch (e) {
            expect(e.message).toContain('eula');
        }
    });
});
