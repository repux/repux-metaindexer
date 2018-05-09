"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require('request-promise');
const extend = require('extend');
class DataProductUpdater {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {DataProductContract} dataProductContract
     * @param {Object} ipfsConfig
     */
    constructor(esClient, esIndexName, dataProductContract, ipfsConfig) {
        this.esClient = esClient;
        this.esIndexName = esIndexName;
        this.dataProductContract = dataProductContract;
        this.ipfsConfig = ipfsConfig;
    }
    /**
     * @param {String} address
     * @returns {Promise<void>}
     */
    async updateDataProduct(address) {
        let contract = await this.dataProductContract.at(address);
        //let productData = await contract.info();
        let metaData = await this.fetchMetaContent(await contract.metaHash());
        let product = {};
        extend(product, metaData /*, productData*/);
        await this.esClient.update({
            index: this.esIndexName,
            type: 'data_product',
            id: address,
            body: {
                doc: product,
                doc_as_upsert: true
            },
        }, (error, response) => {
        });
    }
    fetchMetaContent(fileHash) {
        return JSON.parse(request.get(this.ipfsConfig.httpUrl + '/' + fileHash));
    }
}
exports.DataProductUpdater = DataProductUpdater;
module.exports = DataProductUpdater;
