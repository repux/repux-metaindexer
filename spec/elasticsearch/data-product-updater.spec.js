const mock = require('mock-require');

describe('DataProductUpdater', function() {
    afterEach(function () {
        mock.stopAll();
    });

    it('should update product data in ES', async () => {
        const esClient = { update: jasmine.createSpy('es.update') };
        const dataProductContract = { sellerMetaHash: () => 'hash', address: 'address' };
        const ipfsConfig = { httpUrl: 'host' };
        const requestPromise = { get: jasmine.createSpy('requestPromise.get').and.returnValue('{}') };
        const logger = { info: () => {}, error: '' };

        mock('request-promise', requestPromise);

        const DataProductUpdater = require('../../dist/elasticsearch/data-product-updater').DataProductUpdater;
        const updater = new DataProductUpdater(esClient, 'test', ipfsConfig, logger);

        await updater.updateDataProduct(dataProductContract);

        expect(requestPromise.get).toHaveBeenCalledWith('host/hash');
        expect(esClient.update.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
            index: 'test',
            type: 'data_product',
            id: 'address',
            body: {
                doc: {
                    category: undefined,
                    fullDescription: undefined,
                    maxNumberOfDownloads: undefined,
                    name: undefined,
                    price: undefined,
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
});
