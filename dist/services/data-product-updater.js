"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("./registry");
const categories_1 = require("./../utils/categories");
const request = require('request-promise');
class DataProductUpdater {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {Object} ipfsConfig
     * @param {Object} web3
     * @param {Object} logger
     * @param {Object} tokenContract
     */
    constructor(esClient, esIndexName, ipfsConfig, web3, logger, tokenContract) {
        this.esClient = esClient;
        this.esIndexName = esIndexName;
        this.ipfsConfig = ipfsConfig;
        this.web3 = web3;
        this.logger = logger;
        this.tokenContract = tokenContract;
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
            throw new Error(`Meta file size is too large (${fileSize} > ${this.ipfsConfig.maxMetaFileSize}).`);
        }
        const price = await dataProductContract.price();
        const buyersDeposit = await dataProductContract.buyersDeposit();
        const funds = await this.tokenContract.balanceOf(dataProductContract.address);
        const daysForDeliver = await dataProductContract.daysForDeliver();
        const ownerAddress = await dataProductContract.owner();
        const disabled = await dataProductContract.disabled();
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
            price: price.toString(),
            termsOfUseType: metaData.termsOfUseType,
            name: metaData.name,
            size: metaData.size,
            buyersDeposit: buyersDeposit.toString(),
            funds: funds.toString(),
            fundsToWithdraw: funds.minus(buyersDeposit).toString(),
            daysForDeliver: daysForDeliver.toString(),
            disabled,
            transactions
        };
    }
    async buildProductTransactionsData(dataProductContract) {
        const buyers = await dataProductContract.getBuyersAddresses();
        const transactions = [];
        for (let buyerAddress of buyers) {
            let [publicKey, buyerMetaHash, deliveryDeadline, price, fee, purchased, finalised, rated, rating] = await dataProductContract.getTransactionData(buyerAddress);
            let transaction = {
                buyerAddress,
                publicKey,
                buyerMetaHash,
                deliveryDeadline,
                price: price.toString(),
                fee: fee.toString(),
                purchased,
                finalised,
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
                throw new Error(`Category does not exist: "${category}"`);
            }
        });
        this.logger.info('Product data validation passed.');
    }
    async fetchMetaContent(fileHash) {
        const url = `${this.ipfsConfig.httpUrl}/ipfs/${fileHash}`;
        this.logger.info('fetching meta file content: ' + url);
        let data = await request.get(url);
        return JSON.parse(data);
    }
    async getMetaFileSize(fileHash) {
        const url = `${this.ipfsConfig.httpUrl}/api/v0/object/stat/${fileHash}`;
        this.logger.info('fetching meta file size: %s', url);
        let data = await request.get(url);
        return JSON.parse(data).DataSize;
    }
}
exports.DataProductUpdater = DataProductUpdater;
module.exports.DataProductUpdater = DataProductUpdater;
