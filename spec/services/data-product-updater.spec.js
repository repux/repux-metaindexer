const mock = require('mock-require');

describe('Service - DataProductUpdater', function() {
    afterEach(function () {
        mock.stopAll();
    });

    it('should update product data in ES', async () => {
        const esClient = { update: jasmine.createSpy('es.update') };
        const dataProductContract = {
            sellerMetaHash: () => 'hash',
            owner: () => 'ownerAddress',
            address: 'address',
            price: () => 10
        };
        const ipfsConfig = { httpUrl: 'host' };
        const requestPromise = { get: jasmine.createSpy('requestPromise.get').and.returnValue('{}') };
        const logger = { info: () => {}, error: jasmine.createSpy('logger.error') };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };

        mock('request-promise', requestPromise);

        const DataProductUpdater = mock.reRequire('../../dist/services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', ipfsConfig, web3, logger);

        await updater.updateDataProduct(dataProductContract);

        expect(requestPromise.get).toHaveBeenCalledWith('host/hash');
        expect(esClient.update.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
            index: 'test',
            type: 'data_product',
            id: 'address',
            body: {
                doc: {
                    ownerAddress: 'ownerAddress',
                    sellerMetaHash: 'hash',
                    blockTimestamp: block.timestamp,
                    address: 'address',
                    category: undefined,
                    fullDescription: undefined,
                    maxNumberOfDownloads: undefined,
                    name: undefined,
                    price: 10,
                    shortDescription: undefined,
                    size: undefined,
                    termsOfUseType: undefined,
                    title: undefined,
                    type: undefined
                },
                doc_as_upsert : true
            }
        }));
    });

    it('should update product data in ES with meta data', async () => {
        const esClient = { update: jasmine.createSpy('es.update') };
        const dataProductContract = {
            sellerMetaHash: () => 'hash',
            owner: () => 'ownerAddress',
            address: 'address',
            price: () => 10
        };
        const ipfsConfig = { httpUrl: 'host' };
        const metaData = {
            category: 'category',
            fullDescription: 'fullDescription',
            maxNumberOfDownloads: 20,
            name: 'name',
            shortDescription: 'shortDescription',
            size: 1500,
            title: 'title',
            type: 'type'
        };
        const requestPromise = {
            get: jasmine.createSpy('requestPromise.get').and.returnValue(JSON.stringify(metaData))
        };
        const logger = { info: () => {}, error: jasmine.createSpy('logger.error') };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };

        mock('request-promise', requestPromise);

        const DataProductUpdater = mock.reRequire('../../dist/services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', ipfsConfig, web3, logger);

        await updater.updateDataProduct(dataProductContract);

        expect(requestPromise.get).toHaveBeenCalledWith('host/hash');
        expect(esClient.update.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
            index: 'test',
            type: 'data_product',
            id: 'address',
            body: {
                doc: {
                    ownerAddress: 'ownerAddress',
                    sellerMetaHash: 'hash',
                    blockTimestamp: block.timestamp,
                    address: 'address',
                    category: 'category',
                    fullDescription: 'fullDescription',
                    maxNumberOfDownloads: 20,
                    name: 'name',
                    price: 10,
                    shortDescription: 'shortDescription',
                    size: 1500,
                    termsOfUseType: undefined,
                    title: 'title',
                    type: 'type'
                },
                doc_as_upsert : true
            }
        }));
    });

    it('should ignore corrupted product data', async () => {
        const esClient = { update: jasmine.createSpy('es.update') };
        const dataProductContract = {
            sellerMetaHash: () => 'hash',
            owner: () => 'ownerAddress',
            address: 'address',
            price: () => 10
        };
        const ipfsConfig = { httpUrl: 'host' };
        const requestPromise = {
            get: jasmine.createSpy('requestPromise.get').and.throwError('error')
        };
        const logger = { info: () => {}, error: jasmine.createSpy('logger.error') };
        const block = { timestamp: 123456789 };
        const web3 = { eth: { getBlock: () => block } };

        mock('request-promise', requestPromise);

        const DataProductUpdater = mock.reRequire('../../dist/services/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', ipfsConfig, web3, logger);

        await updater.updateDataProduct(dataProductContract);

        expect(requestPromise.get).toHaveBeenCalledTimes(1);
        expect(requestPromise.get).toHaveBeenCalledWith('host/hash');
        expect(logger.error).toHaveBeenCalledTimes(1);
        expect(esClient.update).not.toHaveBeenCalled();
    });
});
