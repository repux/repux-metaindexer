"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Manager {
    constructor(esClient) {
        this.esClient = esClient;
    }
    async reset(index, mappings) {
        await this.esClient.indices.delete({ index, ignore: [404] });
        await this.esClient.indices.create({
            index,
            body: { mappings }
        }, (res) => {
            console.log(res);
        });
    }
}
exports.Manager = Manager;
module.exports = Manager;
