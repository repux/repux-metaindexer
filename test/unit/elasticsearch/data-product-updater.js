const assert = require('assert');
const mock = require('mock-require');
const sinon = require('sinon');

afterEach(function () {
    mock.stopAll();
});

describe('DataProductUpdater', function() {
    it('should update product data in ES', async () => {
        const esClient = { update: sinon.stub() };
        const dataProductContract = { at: sinon.stub() };
        const ipfsConfig = { host: 'host' };
        const requestPromise = { get: sinon.stub() };
        const logger = { info: sinon.stub(), error: sinon.stub() };

        mock('request-promise', requestPromise);

        esClient.update.callsFake((data) => {
            assert.deepEqual(
                data,
                {
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
                    },
                }
            );
        });
        dataProductContract.at.callsFake((address) => {
            assert.equal(address, 'address');

            return { sellerMetaHash: () => 'hash' };
        });
        requestPromise.get.callsFake((url) => {
            assert(url, 'host/hash');

            return '{}';
        });

        const DataProductUpdater = require('./../../../dist/elasticsearch/data-product-updater');
        const updater = new DataProductUpdater(esClient, 'test', dataProductContract, ipfsConfig, logger);

        await updater.updateDataProduct('address');

        assert(esClient.update.called);
        assert(dataProductContract.at.called);
        assert(requestPromise.get.called);
    });
});
