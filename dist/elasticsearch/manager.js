"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Manager {
    constructor(esClient, logger) {
        this.esClient = esClient;
        this.logger = logger;
    }
    async reset(index, mappings) {
        await this.esClient.indices.delete({ index, ignore: [404] });
        await this.esClient.indices.create({
            index,
            body: { mappings }
        }, (res) => {
            this.logger.error(res);
        });
    }
}
exports.Manager = Manager;
module.exports = Manager;
