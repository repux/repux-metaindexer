"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require('request-promise');
class DataProductUpdater {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {Object} ipfsConfig
     * @param {Object} logger
     */
    constructor(esClient, esIndexName, ipfsConfig, logger) {
        this.esClient = esClient;
        this.esIndexName = esIndexName;
        this.ipfsConfig = ipfsConfig;
        this.logger = logger;
    }
    async updateDataProduct(dataProductContract) {
        this.logger.info('updating data product at: %s', dataProductContract.address);
        let metaData = await this.fetchMetaContent(await dataProductContract.sellerMetaHash());
        this.logger.info('meta data: %s', metaData);
        let product = {
            title: metaData.title,
            shortDescription: metaData.shortDescription,
            fullDescription: metaData.fullDescription,
            type: metaData.type,
            category: metaData.category,
            maxNumberOfDownloads: metaData.maxNumberOfDownloads,
            price: metaData.price,
            termsOfUseType: metaData.termsOfUseType,
            name: metaData.name,
            size: metaData.size
        };
        await this.esClient.update({
            index: this.esIndexName,
            type: 'data_product',
            id: dataProductContract.address,
            body: {
                doc: product,
                doc_as_upsert: true
            },
        }, (error, response) => {
            this.logger.error(error, response);
        });
    }
    async fetchMetaContent(fileHash) {
        const metaUrl = this.ipfsConfig.httpUrl + '/' + fileHash;
        this.logger.info('fetching meta data from: ' + metaUrl);
        let data = await request.get(metaUrl);
        return JSON.parse(data);
    }
}
exports.DataProductUpdater = DataProductUpdater;
module.exports.DataProductUpdater = DataProductUpdater;
