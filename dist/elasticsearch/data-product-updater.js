"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require('request-promise');
class DataProductUpdater {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {DataProductContract} dataProductContract
     * @param {Object} ipfsConfig
     * @param {Object} logger
     */
    constructor(esClient, esIndexName, dataProductContract, ipfsConfig, logger) {
        this.esClient = esClient;
        this.esIndexName = esIndexName;
        this.dataProductContract = dataProductContract;
        this.ipfsConfig = ipfsConfig;
        this.logger = logger;
    }
    /**
     * @param {String} address
     * @returns {Promise<void>}
     */
    async updateDataProduct(address) {
        let contract = await this.dataProductContract.at(address);
        let metaData = await this.fetchMetaContent(await contract.sellerMetaHash());
        let product = {};
        this.logger.info('updating data product...');
        await this.esClient.update({
            index: this.esIndexName,
            type: 'data_product',
            id: address,
            body: {
                doc: product,
                doc_as_upsert: true
            },
        }, (error, response) => {
            this.logger.error(error, response);
        });
    }
    async fetchMetaContent(fileHash) {
        let data = await request.get(this.ipfsConfig.httpUrl + '/' + fileHash);
        return JSON.parse(data);
    }
}
exports.DataProductUpdater = DataProductUpdater;
module.exports = DataProductUpdater;
