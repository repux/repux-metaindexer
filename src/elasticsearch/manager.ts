export class Manager {
    constructor(private esClient: any, private logger: any) {
    }

    async reset(index: string, mappings: any, settings: any) {
        try {
            await this.esClient.indices.delete({
                index, ignore: [404]
            });
            await this.esClient.indices.create({
                index,
                body: {settings, mappings}
            });
        } catch (e) {
            this.logger.error(e);
        }
    }

    async update(index: string, mappings: any, settings: any) {
        const tempIndex = `${index}_reindex_temp`;

        this.logger.info(`Updating index "${index}"`);

        try {
            this.logger.info('deleting temporary index');
            await this.esClient.indices.delete({index: tempIndex, ignore: [404]});

            this.logger.info('updating current index mappings');
            await this.esClient.indices.putMapping({
                index,
                type: index,
                body: {properties: mappings[index].properties}
            });

            this.logger.info('creating temporary index');
            await this.esClient.indices.create({
                index: tempIndex,
                body: {settings, mappings}
            });

            this.logger.info('copying documents to temporary index');
            await this.esClient.reindex({
                refresh: true,
                body: {
                    source: {index},
                    dest: {index: tempIndex}
                }
            });

            this.logger.info('copying documents back to current index');
            await this.esClient.reindex({
                refresh: true,
                body: {
                    source: {index: tempIndex},
                    dest: {index}
                }
            });

            this.logger.info('deleting temporary index');
            await this.esClient.indices.delete({index: tempIndex, ignore: [404]});
        } catch (e) {
            this.logger.error(e);
        }
    }
}

module.exports.Manager = Manager;
