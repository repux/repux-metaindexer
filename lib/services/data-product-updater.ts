import {DATA_PRODUCT_UPDATE_ACTION} from "./registry";
import {Categories} from "./../utils/categories";

const sprintf = require('sprintf-js').sprintf;
const request = require('request-promise');

export class DataProductUpdater {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {Object} ipfsConfig
     * @param {Object} web3
     * @param {Object} logger
     */
    constructor(
        private esClient: any,
        private esIndexName: string,
        private ipfsConfig: any,
        private web3: any,
        private logger: any
    ) {
    }

    public async handleDataProductUpdate(dataProductContract: any, blockNumber: number, action: number) {
        this.logger.info('[action: %s] updating data product at: %s', action, dataProductContract.address);

        try {
            if (DATA_PRODUCT_UPDATE_ACTION.DELETE === action) {
                await this.deleteDataProduct(dataProductContract.address);
            } else {
                await this.updateDataProduct(dataProductContract, blockNumber);
            }
        } catch (e) {
            this.logger.error(e);

            throw e;
        }
    }

    private async updateDataProduct(dataProductContract: any, blockNumber: number) {
        let product = await this.buildProductData(dataProductContract, blockNumber);

        this.logger.info('updating product: %s', product);

        await this.esClient.update(
            {
                index: this.esIndexName,
                type: 'data_product',
                id: product.address,
                body: {
                    doc: product,
                    doc_as_upsert: true
                },
            },
            (error: any, response: any) => {
                this.logger.error(error, response);
            }
        );
    }

    private async deleteDataProduct(address: string) {
        this.logger.info('deleting product: %s', address);

        await this.esClient.delete(
            {
                index: this.esIndexName,
                type: 'data_product',
                id: address,
            },
            (error: any, response: any) => {
                this.logger.error(error, response);
            }
        );
    }

    private async buildProductData(dataProductContract: any, blockNumber: number) {
        let sellerMetaHash = await dataProductContract.sellerMetaHash();

        this.logger.info('meta file hash: %s', sellerMetaHash);

        let fileSize = await this.getMetaFileSize(sellerMetaHash);

        this.logger.info('meta file size: %s', fileSize);

        if (fileSize > this.ipfsConfig.maxMetaFileSize) {
            throw new Error(sprintf(
                'Meta file size is too large (%s > %s).',
                fileSize,
                this.ipfsConfig.maxMetaFileSize
            ));
        }

        let price = await dataProductContract.price();
        let ownerAddress = await dataProductContract.owner();
        let block = this.web3.eth.getBlock(blockNumber);
        let metaData = await this.fetchMetaContent(sellerMetaHash);

        this.validateMetaData(metaData);

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
            size: metaData.size
        };
    }

    private validateMetaData(metaData: any) {
        if (typeof metaData.category === 'undefined'
            || !Array.isArray(metaData.category)
            || metaData.category.length === 0
        ) {
            throw new Error('File category must not be empty.');
        }

        metaData.category.forEach((category: string) => {
            if (!Categories.pathExists(category)) {
                throw new Error(sprintf('Category does not exist: "%s"', category));
            }
        });

        this.logger.info('Product data validation passed.');
    }

    private async fetchMetaContent(fileHash: string) {
        const url = sprintf('%s/ipfs/%s', this.ipfsConfig.httpUrl, fileHash);

        this.logger.info('fetching meta file content: ' + url);
        let data = await request.get(url);

        return JSON.parse(data);
    }

    private async getMetaFileSize(fileHash: string) {
        const url = sprintf('%s/api/v0/object/stat/%s', this.ipfsConfig.httpUrl, fileHash);

        this.logger.info('fetching meta file size: %s', url);
        let data = await request.get(url);

        return JSON.parse(data).DataSize;
    }
}

module.exports.DataProductUpdater = DataProductUpdater;
