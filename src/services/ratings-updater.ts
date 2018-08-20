import {RatingArray, Ratings} from "../utils/ratings";

export class RatingsUpdater {
    /**
     * @param {ESClient} esClient
     * @param {Object} config
     * @param {Object} web3
     * @param {Object} logger
     */
    constructor(
        private esClient: any,
        private config: any,
        private web3: any,
        private logger: any
    ) {
    }

    public async recalculateRatingsForUser(userAddress: string) {
        const ordersQuery = {
            bool: {
                must: [
                    {
                        match: {
                            'orders.rated': true
                        }
                    }
                ]
            }
        };
        const query = {
            bool: {
                must: [
                    {
                        match: {
                            ownerAddress: userAddress
                        }
                    },
                    {
                        nested: {
                            path: 'orders',
                            query: ordersQuery
                        }
                    }
                ]
            }
        };

        const queryResult = await this.esClient.search({
            index: this.config.elasticsearch.indexes.dataProduct,
            _source: ['price', 'orders.rating'],
            body: { query }
        });

        const dataProducts = queryResult.hits.hits.map((entity: any) => entity._source);
        const ratingsList: RatingArray = [];

        dataProducts.forEach((dataProduct: any)=> {
            dataProduct.orders.forEach((order: any) => {
                ratingsList.push({
                    price: this.web3.fromWei(dataProduct.price, 'ether'),
                    score: order.rating
                });
            })
        });

        const sellerRating = Ratings.asymptoticTrustAlgorithm(
                ratingsList,
                this.config.ratings.gamma,
                this.config.ratings.alpha
            )
            .slice(-1)[0] * 100;

        await this.updateSellerRating(userAddress, sellerRating);

        this.logger.info('updated seller rating: %s / %s', userAddress, sellerRating);
    }

    public updateSellerRating(address: string, sellerRating: number) {
        return this.esClient.update(
            {
                index: this.config.elasticsearch.indexes.user,
                type: this.config.elasticsearch.indexes.user,
                id: address,
                body: {
                    doc: { address, sellerRating },
                    doc_as_upsert: true,
                },
                refresh: 'wait_for',
            },
        );
    }
}

module.exports.RatingsUpdater = RatingsUpdater;
