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

    public async updateDataProduct(dataProductContract: any, blockNumber: number) {
        this.logger.info('updating data product at: %s', dataProductContract.address);

        let sellerMetaHash = await dataProductContract.sellerMetaHash();
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
            price: metaData.price,
            termsOfUseType: metaData.termsOfUseType,
            name: metaData.name,
            size: metaData.size
        };

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

    private async fetchMetaContent(fileHash: string) {
        const metaUrl = this.ipfsConfig.httpUrl + '/' + fileHash;

        this.logger.info('fetching meta data from: ' + metaUrl);
        let data = await request.get(metaUrl);

        return JSON.parse(data);
    }
}

module.exports.DataProductUpdater = DataProductUpdater;
