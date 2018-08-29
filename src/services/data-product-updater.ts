import {DATA_PRODUCT_UPDATE_ACTION} from "./registry";
import {SellerMetaDataSchema} from "../validation/seller-meta-data.schema";
import {ContractFactory} from "./contract-factory";
import {RatingArray, Ratings} from "../utils/ratings";

const request = require('request-promise');

export class DataProductUpdater {
    /**
     * @param {Client} esClient
     * @param {string} esIndexName
     * @param {Object} config
     * @param {Object} web3
     * @param {Object} logger
     * @param {Object} tokenContract
     * @param {Object} orderContractFactory
     */
    constructor(
        private esClient: any,
        private esIndexName: string,
        private config: any,
        private web3: any,
        private logger: any,
        private tokenContract: any,
        private orderContractFactory: ContractFactory
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

        if (fileSize > this.config.ipfs.maxMetaFileSize) {
            throw new Error(`Meta file size is too large (${fileSize} > ${this.config.ipfs.maxMetaFileSize}).`);
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
        const creationTimestamp = parseInt(await dataProductContract.creationTimeStamp.call(), 10);

        this.validateMetaData(metaData);

        const orders = await this.buildProductOrdersData(dataProductContract);
        const rating = this.calculateRating(orders);

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
            orders,
            eula: metaData.eula,
            sampleFile: metaData.sampleFile || null,
            rating,
            creationTimestamp
        };
    }

    private async buildProductOrdersData(dataProductContract: any) {
        const ordersAddresses = await dataProductContract.getOrdersAddresses();
        const orders = [];
        let orderContract;

        for (let orderAddress of ordersAddresses) {
            orderContract = await this.orderContractFactory.at(orderAddress);

            let order = {
                buyerAddress: await orderContract.buyerAddress(),
                publicKey: await orderContract.buyerPublicKey(),
                buyerMetaHash: await orderContract.buyerMetaHash(),
                rateDeadline: await orderContract.rateDeadline(),
                deliveryDeadline: await orderContract.deliveryDeadline(),
                price: (await orderContract.price()).toString(),
                fee: (await orderContract.fee()).toString(),
                purchased: await orderContract.purchased(),
                finalised: await orderContract.finalised(),
                rated: await orderContract.rated(),
                rating: (await orderContract.rating()).toString()
            };

            orders.push(order);
        }

        return orders;
    }

    private validateMetaData(metaData: any) {
        const validationResult = SellerMetaDataSchema.validate(metaData);

        if (validationResult.error) {
            throw new Error(validationResult.error);
        }

        this.logger.info('Product data validation passed.');
    }

    private async fetchMetaContent(fileHash: string) {
        const url = `${this.config.ipfs.httpUrl}/api/v0/cat/${fileHash}`;

        this.logger.info('fetching meta file content: ' + url);
        let data = await request.get({ url, timeout: this.config.ipfs.requestTimeoutMs });

        return JSON.parse(data);
    }

    private async getMetaFileSize(fileHash: string) {
        const url = `${this.config.ipfs.httpUrl}/api/v0/object/stat/${fileHash}`;

        this.logger.info('fetching meta file size: %s', url);
        let data = await request.get({ url, timeout: this.config.ipfs.requestTimeoutMs });

        return JSON.parse(data).DataSize;
    }

    private calculateRating(orders: Array<any>): number {
        const ratingsList: RatingArray = [];

        orders
            .filter(order => order.rated)
            .forEach(order => {
                ratingsList.push({price: this.web3.fromWei(order.price, 'ether'), score: order.rating});
            });

        return Ratings
            .asymptoticTrustAlgorithm(ratingsList, this.config.ratings.gamma, this.config.ratings.alpha)
            .pop() * 100;
    }
}

module.exports.DataProductUpdater = DataProductUpdater;
