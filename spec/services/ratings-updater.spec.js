const config = require('../../config/config');
const Web3 = require('web3');

const DIST_DIR = './../../dist/';

const mock = require('mock-require');

describe('Service - RatingsUpdater', () => {
    afterEach(() => {
        mock.stopAll();
    });

    it('recalculates user rating and updates it', async () => {
        const web3 = new Web3();
        const dataProduct = {
            price: web3.toWei(3.45),
            transactions: [
                { rating: 5 },
            ]
        };
        const Ratings = {
            asymptoticTrustAlgorithm: jasmine.createSpy('ratings.asymptoticTrustAlgorithm').and.returnValue([0, 0.123])
        };
        const esClient = {
            search: jasmine.createSpy('es.search').and.returnValue(Promise.resolve({
                hits: {
                    hits: [{ _source: dataProduct }]
                }
            })),
            update: jasmine.createSpy('es.update').and.returnValue(Promise.resolve())
        };
        const logger = { info: () => {} };

        mock(DIST_DIR + 'utils/ratings', { Ratings });
        const RatingsUpdater = mock.reRequire(DIST_DIR + 'services/ratings-updater').RatingsUpdater;

        const updater = new RatingsUpdater(esClient, config, web3, logger);

        await updater.recalculateRatingsForUser('0x12345');

        expect(Ratings.asymptoticTrustAlgorithm).toHaveBeenCalledTimes(1);
        expect(Ratings.asymptoticTrustAlgorithm.calls.mostRecent().args[0]).toEqual([{
            price: web3.fromWei(dataProduct.price),
            score: dataProduct.transactions[0].rating
        }]);

        expect(esClient.search).toHaveBeenCalledTimes(1);
        expect(esClient.update).toHaveBeenCalledTimes(1);
        expect(esClient.update.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
            index: config.elasticsearch.indexes.user,
            type: config.elasticsearch.indexes.user,
            id: '0x12345',
            body: {
                doc: { address: '0x12345', sellerRating: 12.3 },
                doc_as_upsert: true,
            },
            refresh: 'wait_for',
        }));
    });
});
