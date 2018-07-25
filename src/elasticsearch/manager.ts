export class Manager {
    constructor(private esClient: any, private logger: any) {
    }

    async reset(index: string, mappings: any, settings: any) {
        try {
            await this.esClient.indices.delete(
                {
                    index, ignore: [404]
                }
            );
            await this.esClient.indices.create(
                {
                    index,
                    body: {settings, mappings}
                }
            );
        } catch (e) {
            this.logger.error(e);
        }
    }

    async update(index: string, mappings: any, settings: any) {
        try {
            await this.esClient.indices.upgrade(
                {
                    index,
                    body: {settings, mappings}
                }
            );
        } catch (e) {
            this.logger.error(e);
        }
    }
}

module.exports.Manager = Manager;
