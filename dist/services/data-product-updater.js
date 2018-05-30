"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("./registry");
const request = require('request-promise');
class DataProductUpdater {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {Object} ipfsConfig
     * @param {Object} web3
     * @param {Object} logger
     */
    constructor(esClient, esIndexName, ipfsConfig, web3, logger) {
        this.esClient = esClient;
        this.esIndexName = esIndexName;
        this.ipfsConfig = ipfsConfig;
        this.web3 = web3;
        this.logger = logger;
    }
    async updateDataProduct(dataProductContract, blockNumber, action) {
        this.logger.info('updating data product at: %s', dataProductContract.address);
        try {
            let sellerMetaHash = await dataProductContract.sellerMetaHash();
            let price = await dataProductContract.price();
            let metaData = await this.fetchMetaContent(sellerMetaHash);
            let ownerAddress = await dataProductContract.owner();
            let block = this.web3.eth.getBlock(blockNumber);
            this.logger.info('meta data: %s', metaData);
            let product = {
                address: dataProductContract.address,
                ownerAddress,
                sellerMetaHash,
                blockTimestamp: block.timestamp,
                title: metaData.title,
                shortDescription: metaData.shortDescription,
                fullDescription: metaData.fullDescription,
                type: metaData.type,
                category: metaData.category,
                maxNumberOfDownloads: metaData.maxNumberOfDownloads,
                price: price,
                termsOfUseType: metaData.termsOfUseType,
                name: metaData.name,
                size: metaData.size
            };
            if (registry_1.DATA_PRODUCT_UPDATE_ACTION.DELETE === action) {
                await this.esClient.delete({
                    index: this.esIndexName,
                    type: 'data_product',
                    id: product.address,
                }, (error, response) => {
                    this.logger.error(error, response);
                });
            }
            else {
                await this.esClient.update({
                    index: this.esIndexName,
                    type: 'data_product',
                    id: product.address,
                    body: {
                        doc: product,
                        doc_as_upsert: true
                    },
                }, (error, response) => {
                    this.logger.error(error, response);
                });
            }
        }
        catch (e) {
            this.logger.error(e);
        }
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
