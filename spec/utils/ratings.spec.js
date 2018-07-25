const DIST_DIR = './../../dist/';

const mock = require('mock-require');

describe('Utility - Ratings', () => {
    it('should calculate rating with a previous value', () => {
        const Ratings = mock.reRequire(DIST_DIR + 'utils/ratings').Ratings;

        const dataSets = [
            { prev: 0, price: 1, score: 5, gamma: 100, alpha: 0.5, expected: 0.00499983333999973 },
            { prev: 0.1, price: 2, score: 4, gamma: 200, alpha: 0.35, expected: 0.1 },
            { prev: 0.1, price: 3, score: 4, gamma: 300, alpha: 0.01, expected: 0.1 },
            { prev: 0.01, price: 4, score: 3, gamma: 400, alpha: 0.15, expected: 0.00999250024999 },
            { prev: 0.99, price: 5, score: 3, gamma: 300, alpha: 0.2, expected: 0.9883501527608044 },
            { prev: 0.0001, price: 6, score: 2, gamma: 200, alpha: 0.3, expected: 0.0000991002699028354 },
            { prev: 0.9, price: 7, score: 2, gamma: 100, alpha: 0.4, expected: 0.8748410794860856 },
            { prev: 0.5, price: 8, score: 1, gamma: 200, alpha: 0.5, expected: 0.4800106598444182 },
            { prev: 0.4, price: 9, score: 1, gamma: 300, alpha: 0.4, expected: 0.39040287896357756 },
            { prev: 0.3, price: 1, score: 2, gamma: 400, alpha: 0.1, expected: 0.2999250001562496 },
            { prev: 0.3, price: 2, score: 4, gamma: 300, alpha: 0.2, expected: 0.3 },
            { prev: 0.5, price: 3, score: 5, gamma: 200, alpha: 0.3, expected: 0.5022498312651861 },
        ];

        for (let data of dataSets) {
            expect(Ratings.asymptoticTrustAlgorithmFromPrevious(data.prev, data.price, data.score, data.gamma, data.alpha))
                .toEqual(data.expected);
        }
    });

    it('should create an array of calculated ratings', () => {
        const Ratings = mock.reRequire(DIST_DIR + 'utils/ratings').Ratings;

        const ratings = [
            { price: 1, score: 5 },
            { price: 2, score: 4 },
            { price: 3, score: 4 },
            { price: 4, score: 3 },
            { price: 5, score: 3 },
            { price: 6, score: 2 },
            { price: 7, score: 2 },
            { price: 8, score: 1 },
            { price: 9, score: 1 },
            { price: 1, score: 2 },
            { price: 2, score: 4 },
            { price: 3, score: 5 },
        ];

        expect(Ratings.asymptoticTrustAlgorithm(ratings, 350, 0.15)).toEqual([
            0,
            0.0004285702623944785,
            0.0004285702623944785,
            0.0004285702623944785,
            0.0004282029324477403,
            0.000427744174799125,
            0.00042664436894075783,
            0.0004253646064643823,
            0.0004224483284426211,
            0.00041919015943288514,
            0.0004190105069962638,
            0.0004190105069962638,
            0.0017041545921536207,
        ]);
    });
});
