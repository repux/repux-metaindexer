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
        daysToDeliver: 7,
        daysToRate: 7,
        eula: {
            type: 'STANDARD',
            fileHash: 'hash',
            fileName: 'file.txt'
        },
        sampleFile: [
            { title: 'sample 1', 'fileHash': 'sample-hash-1', fileName: 'file.txt' },
            { title: 'sample 2', 'fileHash': 'sample-hash-2', fileName: 'file.txt' },
        ],
        creationTimestamp: 0
    };

    const IPFS_CONFIG = {
        httpUrl: 'host',
        requestTimeoutMs: 1234,
        maxMetaFileSize: 1000
    };

    const RATINGS_CONFIG = {
        gamma: 150,
        alpha: 0.5
    };

    const CONFIG = {
        ipfs: IPFS_CONFIG,
        ratings: RATINGS_CONFIG
    };

    afterEach(() => {
        mock.stopAll();
    });

    function mockSellerMetaSchema() {
        const SellerMetaDataSchema = {
            validate: jasmine.createSpy('validationSchema.validate').and.returnValue({})
        };

        mock(DIST_DIR + 'validation/seller-meta-data.schema', { SellerMetaDataSchema });

        return SellerMetaDataSchema;
    }

    it('should update product data in ES', async () => {
        const size = { DataSize: 101 };
        const esClient = { update: jasmine.createSpy('es.update') };
        const dataProductContract = {
            sellerMetaHash: () => 'hash',
            owner: () => 'ownerAddress',
            address: 'address',
            price: () => 10,
            getOrdersAddresses: () => [],
            buyersDeposit: () => new BigNumber(0),
            daysToDeliver: () => 7,
            daysToRate: () => 7,
            disabled: () => false,
            creationTimeStamp: { call: () => new BigNumber(0) }
        };
        const tokenContract = { balanceOf: () => new BigNumber(0) };
        const requestPromise = {
            get: jasmine.createSpy('requestPromise.get').and.returnValues(
                JSON.stringify(size),
                JSON.stringify(VALID_METADATA)
            )
        };
        const logger = { info: () => {}, error: jasmine.createSpy('logger.error') };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };

        mockSellerMetaSchema();
        mock('request-promise', requestPromise);

        const DataProductUpdater = mock.reRequire(DIST_DIR + 'services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', CONFIG, web3, logger, tokenContract);

        await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.UPDATE);

        expect(requestPromise.get).toHaveBeenCalledWith({ url: 'host/api/v0/object/stat/hash', timeout: IPFS_CONFIG.requestTimeoutMs });
        expect(requestPromise.get).toHaveBeenCalledWith({ url: 'host/api/v0/cat/hash', timeout: IPFS_CONFIG.requestTimeoutMs });
        expect(esClient.update.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
            index: 'test',
            type: 'data_product',
            id: 'address',
            body: {
                doc: Object.assign({}, VALID_METADATA, {
                    address: 'address',
                    ownerAddress: 'ownerAddress',
                    sellerMetaHash: 'hash',
                    lastUpdateTimestamp: block.timestamp,
                    price: '10',
                    buyersDeposit: '0',
                    funds: '0',
                    fundsToWithdraw: '0',
                    daysToDeliver: '7',
                    daysToRate: '7',
                    disabled: false,
                    orders: [],
                    rating: 0,
                }),
                doc_as_upsert : true
            },
            refresh: 'wait_for'
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
            getOrdersAddresses: () => [],
            buyersDeposit: () => new BigNumber(0),
            daysToDeliver: () => 7,
            daysToRate: () => 7,
            disabled: () => false,
            creationTimeStamp: { call: () => new BigNumber(0) }
        };
        const tokenContract = { balanceOf: () => new BigNumber(0) };
        const requestPromise = {
            get: jasmine.createSpy('requestPromise.get').and.returnValues(
                JSON.stringify(size),
                JSON.stringify(VALID_METADATA)
            )
        };
        const logger = { info: () => {}, error: jasmine.createSpy('logger.error') };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };

        mockSellerMetaSchema();
        mock('request-promise', requestPromise);

        const DataProductUpdater = mock.reRequire(DIST_DIR + 'services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', CONFIG, web3, logger, tokenContract);

        await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.UPDATE);

        expect(requestPromise.get).toHaveBeenCalledWith({ url: 'host/api/v0/object/stat/hash', timeout: IPFS_CONFIG.requestTimeoutMs });
        expect(requestPromise.get).toHaveBeenCalledWith({ url: 'host/api/v0/cat/hash', timeout: IPFS_CONFIG.requestTimeoutMs });
        expect(esClient.update.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
            index: 'test',
            type: 'data_product',
            id: 'address',
            body: {
                doc: Object.assign({}, VALID_METADATA, {
                    address: 'address',
                    ownerAddress: 'ownerAddress',
                    sellerMetaHash: 'hash',
                    lastUpdateTimestamp: block.timestamp,
                    price: '10',
                    buyersDeposit: '0',
                    funds: '0',
                    fundsToWithdraw: '0',
                    daysToDeliver: '7',
                    daysToRate: '7',
                    disabled: false,
                    orders: [],
                    rating: 0,
                }),
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
            daysToDeliver: () => 7,
            daysToRate: () => 7,
            disabled: () => false,
            creationTimeStamp: { call: () => new BigNumber(0) }
        };
        const tokenContract = { balanceOf: () => new BigNumber(0) };
        const requestPromise = {
            get: jasmine.createSpy('requestPromise.get').and.throwError('request error')
        };
        const logger = { info: () => {} };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };

        mock('request-promise', requestPromise);

        const DataProductUpdater = mock.reRequire(DIST_DIR + 'services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', CONFIG, web3, logger, tokenContract);

        try {
            await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.UPDATE);
            expect(true).toBe(false);
        }
        catch (e) {
        }

        expect(requestPromise.get).toHaveBeenCalledTimes(1);
        expect(requestPromise.get).toHaveBeenCalledWith({ url: 'host/api/v0/object/stat/hash', timeout: IPFS_CONFIG.requestTimeoutMs });
        expect(esClient.update).not.toHaveBeenCalled();
    });

    it('should delete data product on delete action', async () => {
        const esClient = { 'delete': jasmine.createSpy('es.delete') };
        const dataProductContract = { address: 'address' };
        const tokenContract = { balanceOf: () => new BigNumber(0) };
        const logger = { info: () => {} };
        const web3 = {};

        const DataProductUpdater = mock.reRequire(DIST_DIR + 'services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', CONFIG, web3, logger, tokenContract);

        await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.DELETE);

        expect(esClient.delete).toHaveBeenCalledTimes(1);
        expect(esClient.delete.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
            index: 'test',
            type: 'data_product',
            id: 'address'
        }));
    });

    it('should check meta file size', async () => {
        const size = { DataSize: 1001 };
        const esClient = {};
        const dataProductContract = {
            sellerMetaHash: () => 'hash',
            owner: () => 'ownerAddress',
            address: 'address',
            price: () => 10,
            buyersDeposit: () => new BigNumber(0),
            daysToDeliver: () => 7,
            daysToRate: () => 7,
            disabled: () => false,
            creationTimeStamp: { call: () => new BigNumber(0) }
        };
        const tokenContract = { balanceOf: () => new BigNumber(0) };
        const requestPromise = {
            get: jasmine.createSpy('requestPromise.get').and.returnValues(JSON.stringify(size), '{}')
        };
        const logger = { info: () => {}, error: jasmine.createSpy('logger.error') };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };

        mock('request-promise', requestPromise);

        const DataProductUpdater = mock.reRequire(DIST_DIR + 'services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', CONFIG, web3, logger, tokenContract);

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
            getOrdersAddresses: () => [],
            buyersDeposit: () => new BigNumber(0),
            daysToDeliver: () => 7,
            daysToRate: () => 7,
            disabled: () => false,
            creationTimeStamp: { call: () => new BigNumber(0) }
        };
        const tokenContract = { balanceOf: () => new BigNumber(0) };
        const requestPromise = {
            get: jasmine.createSpy('requestPromise.get')
        };
        const logger = { info: () => {}, error: jasmine.createSpy('logger.error') };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };
        const SellerMetaDataSchema = {
            validate: jasmine.createSpy('validationSchema.validate').and.returnValue({})
        };

        mock('request-promise', requestPromise);
        mock(DIST_DIR + 'validation/seller-meta-data.schema', { SellerMetaDataSchema });

        const DataProductUpdater = mock.reRequire(DIST_DIR + 'services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', CONFIG, web3, logger, tokenContract);

        requestPromise.get.and.returnValues(JSON.stringify(size), JSON.stringify(VALID_METADATA));

        await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.CREATE);
        expect(SellerMetaDataSchema.validate).toHaveBeenCalledTimes(1);

        requestPromise.get.and.returnValues(JSON.stringify(size), JSON.stringify(VALID_METADATA));
        SellerMetaDataSchema.validate.and.returnValue({ error: 'some error' });

        try {
            await updater.handleDataProductUpdate(dataProductContract, 1, DATA_PRODUCT_UPDATE_ACTION.CREATE);
            expect(true).toBe(false);
        } catch (e) {
            expect(SellerMetaDataSchema.validate).toHaveBeenCalledTimes(2);
            expect(e.message).toContain('some error');
        }
    });
});
