import {DATA_PRODUCT_UPDATE_ACTION} from "./registry";
import {SellerMetaDataSchema} from "../validation/seller-meta-data.schema";
import {ContractFactory} from "./contract-factory";

const request = require('request-promise');

export class DataProductUpdater {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {Object} ipfsConfig
     * @param {Object} web3
     * @param {Object} logger
     * @param {Object} tokenContract
     */
    constructor(
        private esClient: any,
        private esIndexName: string,
        private ipfsConfig: any,
        private web3: any,
        private logger: any,
        private tokenContract: any,
        private transactionContractFactory: ContractFactory
    ) {
    }

    public async handleDataProductUpdate(dataProductContract: any, blockNumber: number, action: number) {
        this.logger.info(
            '[action: %s, block: %s] updating data product at: %s',
            action,
            blockNumber,
            dataProductContract.address
        );

        if (DATA_PRODUCT_UPDATE_ACTION.DELETE === action) {
            await this.deleteDataProduct(dataProductContract.address);
        } else {
            await this.updateDataProduct(dataProductContract, blockNumber);
        }

        this.logger.info('updated: %s', dataProductContract.address);
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
                    doc_as_upsert: true,
                },
                refresh: 'wait_for',
            },
        );
    }

    private async deleteDataProduct(address: string) {
        this.logger.info('deleting product: %s', address);

        await this.esClient.delete(
            {
                index: this.esIndexName,
                type: 'data_product',
                id: address,
                refresh: 'wait_for',
            },
        );
    }

    private async buildProductData(dataProductContract: any, blockNumber: number) {
        const sellerMetaHash = await dataProductContract.sellerMetaHash();
        const fileSize = await this.getMetaFileSize(sellerMetaHash);

        this.logger.info('meta file size: %s', fileSize);

        if (fileSize > this.ipfsConfig.maxMetaFileSize) {
            throw new Error(`Meta file size is too large (${fileSize} > ${this.ipfsConfig.maxMetaFileSize}).`);
        }

        const price = await dataProductContract.price();
        const buyersDeposit = await dataProductContract.buyersDeposit();
        const funds = await this.tokenContract.balanceOf(dataProductContract.address);
        const daysToDeliver = await dataProductContract.daysToDeliver();
        const daysToRate = await dataProductContract.daysToRate();
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
            name: metaData.name,
            size: metaData.size,
            buyersDeposit: buyersDeposit.toString(),
            funds: funds.toString(),
            fundsToWithdraw: funds.minus(buyersDeposit).toString(),
            daysToDeliver: daysToDeliver.toString(),
            daysToRate: daysToRate.toString(),
            disabled,
            transactions,
            eula: metaData.eula,
            sampleFile: metaData.sampleFile || null
        };
    }

    private async buildProductTransactionsData(dataProductContract: any) {
        const transactionsAddresses = await dataProductContract.getTransactionsAddresses();
        const transactions = [];
        let transactionContract;

        for (let transactionAddress of transactionsAddresses) {
            transactionContract = await this.transactionContractFactory.at(transactionAddress);

            let transaction = {
                buyerAddress: await transactionContract.buyerAddress(),
                publicKey: await transactionContract.buyerPublicKey(),
                buyerMetaHash: await transactionContract.buyerMetaHash(),
                rateDeadline: await transactionContract.rateDeadline(),
                deliveryDeadline: await transactionContract.deliveryDeadline(),
                price: (await transactionContract.price()).toString(),
                fee: (await transactionContract.fee()).toString(),
                purchased: await transactionContract.purchased(),
                finalised: await transactionContract.finalised(),
                rated: await transactionContract.rated(),
                rating: (await transactionContract.rating()).toString()
            };

            transactions.push(transaction);
        }

        return transactions;
    }

    private validateMetaData(metaData: any) {
        const validationResult = SellerMetaDataSchema.validate(metaData);

        if (validationResult.error) {
            throw new Error(validationResult.error);
        }

        this.logger.info('Product data validation passed.');
    }

    private async fetchMetaContent(fileHash: string) {
        const url = `${this.ipfsConfig.httpUrl}/api/v0/cat/${fileHash}`;

        this.logger.info('fetching meta file content: ' + url);
        let data = await request.get(url);

        return JSON.parse(data);
    }

    private async getMetaFileSize(fileHash: string) {
        const url = `${this.ipfsConfig.httpUrl}/api/v0/object/stat/${fileHash}`;

        this.logger.info('fetching meta file size: %s', url);
        let data = await request.get(url);

        return JSON.parse(data).DataSize;
    }
}

module.exports.DataProductUpdater = DataProductUpdater;
