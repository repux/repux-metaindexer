const request = require('request-promise');
const extend = require('extend');

export class DataProductUpdater {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {DataProductContract} dataProductContract
     * @param {Object} ipfsConfig
     */
    constructor(
        private esClient: any,
        private esIndexName: String,
        private dataProductContract: any,
        private ipfsConfig: any
    ) {
    }

    /**
     * @param {String} address
     * @returns {Promise<void>}
     */
    async updateDataProduct(address: String) {
        let contract = await this.dataProductContract.at(address);
        //let productData = await contract.info();
        let metaData = await this.fetchMetaContent(await contract.metaHash());
        let product = {};

        extend(product, metaData/*, productData*/);

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

            }
        );
    }

    fetchMetaContent(fileHash: String) {
        return JSON.parse(request.get(this.ipfsConfig.httpUrl + '/' + fileHash));
    }
}

module.exports = DataProductUpdater;
