"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Manager {
    constructor(esClient, logger) {
        this.esClient = esClient;
        this.logger = logger;
    }
    async reset(index, mappings) {
        try {
            await this.esClient.indices.delete({
                index, ignore: [404]
            });
            await this.esClient.indices.create({
                index,
                body: { mappings }
            });
        }
        catch (e) {
            this.logger.error(e);
        }
    }
}
exports.Manager = Manager;
module.exports.Manager = Manager;
