"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("./registry");
const categories_1 = require("./../utils/categories");
const sprintf = require('sprintf-js').sprintf;
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
    async handleDataProductUpdate(dataProductContract, blockNumber, action) {
        this.logger.info('[action: %s, block: %s] updating data product at: %s', action, blockNumber, dataProductContract.address);
        if (registry_1.DATA_PRODUCT_UPDATE_ACTION.DELETE === action) {
            await this.deleteDataProduct(dataProductContract.address);
        }
        else {
            await this.updateDataProduct(dataProductContract, blockNumber);
        }
        this.logger.info('updated: %s', dataProductContract.address);
    }
    async updateDataProduct(dataProductContract, blockNumber) {
        let product = await this.buildProductData(dataProductContract, blockNumber);
        this.logger.info('updating product: %s', product);
        await this.esClient.update({
            index: this.esIndexName,
            type: 'data_product',
            id: product.address,
            body: {
                doc: product,
                doc_as_upsert: true
            },
        });
    }
    async deleteDataProduct(address) {
        this.logger.info('deleting product: %s', address);
        await this.esClient.delete({
            index: this.esIndexName,
            type: 'data_product',
            id: address,
        });
    }
    async buildProductData(dataProductContract, blockNumber) {
        const sellerMetaHash = await dataProductContract.sellerMetaHash();
        const fileSize = await this.getMetaFileSize(sellerMetaHash);
        this.logger.info('meta file size: %s', fileSize);
        if (fileSize > this.ipfsConfig.maxMetaFileSize) {
            throw new Error(sprintf('Meta file size is too large (%s > %s).', fileSize, this.ipfsConfig.maxMetaFileSize));
        }
        const price = await dataProductContract.price();
        const ownerAddress = await dataProductContract.owner();
        const block = this.web3.eth.getBlock(blockNumber);
        const metaData = await this.fetchMetaContent(sellerMetaHash);
        this.validateMetaData(metaData);
        const transactions = await this.buildProductTransactionsData(dataProductContract);
        return {
            address: dataProductContract.address,
            ownerAddress,
            sellerMetaHash,
            lastUpdateTimestamp: block.timestamp,
            title: metaData.title,
            shortDescription: metaData.shortDescription,
            fullDescription: metaData.fullDescription,
            type: metaData.type,
            category: metaData.category,
            maxNumberOfDownloads: metaData.maxNumberOfDownloads,
            price: price,
            termsOfUseType: metaData.termsOfUseType,
            name: metaData.name,
            size: metaData.size,
            transactions
        };
    }
    async buildProductTransactionsData(dataProductContract) {
        const buyers = await dataProductContract.getBuyersAddresses();
        const transactions = [];
        for (let buyerAddress of buyers) {
            let [publicKey, buyerMetaHash, price, purchased, approved, rated, rating] = await dataProductContract.getTransactionData(buyerAddress);
            let transaction = {
                buyerAddress,
                publicKey,
                buyerMetaHash,
                price: price.toString(),
                purchased,
                approved,
                rated,
                rating: rating.toString()
            };
            transactions.push(transaction);
        }
        return transactions;
    }
    validateMetaData(metaData) {
        if (typeof metaData.category === 'undefined'
            || !Array.isArray(metaData.category)
            || metaData.category.length === 0) {
            throw new Error('File category must not be empty.');
        }
        metaData.category.forEach((category) => {
            if (!categories_1.Categories.pathExists(category)) {
                throw new Error(sprintf('Category does not exist: "%s"', category));
            }
        });
        this.logger.info('Product data validation passed.');
    }
    async fetchMetaContent(fileHash) {
        const url = sprintf('%s/ipfs/%s', this.ipfsConfig.httpUrl, fileHash);
        this.logger.info('fetching meta file content: ' + url);
        let data = await request.get(url);
        return JSON.parse(data);
    }
    async getMetaFileSize(fileHash) {
        const url = sprintf('%s/api/v0/object/stat/%s', this.ipfsConfig.httpUrl, fileHash);
        this.logger.info('fetching meta file size: %s', url);
        let data = await request.get(url);
        return JSON.parse(data).DataSize;
    }
}
exports.DataProductUpdater = DataProductUpdater;
module.exports.DataProductUpdater = DataProductUpdater;
