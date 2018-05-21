import {ContractFactory} from "../services/contract-factory";

export class Manager {
    constructor(private esClient: any, private logger: any) {
    }

    async reset(index: string, mappings: any) {
        try {
            await this.esClient.indices.delete(
                {
                    index, ignore: [404]
                }
            );
            await this.esClient.indices.create(
                {
                    index,
                    body: {mappings}
                }
            );
        } catch (e) {
            this.logger.error(e);
        }
    }
}

module.exports.Manager = Manager;
