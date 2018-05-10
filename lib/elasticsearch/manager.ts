export class Manager {
    constructor(private esClient: any) {
    }

    async reset(index: String, mappings: any) {
        await this.esClient.indices.delete({ index, ignore: [404] });
        await this.esClient.indices.create(
            {
                index,
                body: { mappings }
            },
            (res: any) => {
                console.log(res);
            }
        );
    }
}

module.exports = Manager;
