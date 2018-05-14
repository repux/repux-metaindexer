const request = require('request-promise');

export class DataProductUpdater {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {DataProductContract} dataProductContract
     * @param {Object} ipfsConfig
     * @param {Object} logger
     */
    constructor(
        private esClient: any,
        private esIndexName: String,
        private dataProductContract: any,
        private ipfsConfig: any,
        private logger: any
    ) {
    }

    /**
     * @param {String} address
     * @returns {Promise<void>}
     */
    async updateDataProduct(address: String) {
        let contract = await this.dataProductContract.at(address);
        let metaData = await this.fetchMetaContent(await contract.sellerMetaHash());
        let product = {
            title: metaData.title
        };

        this.logger.info('updating data product...');

        await this.esClient.update(
            {
                index: this.esIndexName,
                type: 'data_product',
                id: address,
                body: {
                    doc: product,
                    doc_as_upsert : true
                },
            },
            (error: any, response: any) => {
                this.logger.error(error, response);
            }
        );
    }

    async fetchMetaContent(fileHash: String) {
        console.log(this.ipfsConfig.httpUrl + '/' + fileHash);
        let data = await request.get(this.ipfsConfig.httpUrl + '/' + fileHash);

        return JSON.parse(data);
    }
}

module.exports = DataProductUpdater;
