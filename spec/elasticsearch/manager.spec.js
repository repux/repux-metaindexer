const ROOT_DIR = './../../';
const DIST_DIR = ROOT_DIR + 'dist/';

describe('Manager', () => {
    it('should reset an index', async function () {
        const esClient = {
            indices: jasmine.createSpyObj('indices', ['delete', 'create'])
        };

        const mappings = { property: "value" };
        const logger = { error: jasmine.createSpy('logger.error') };

        const Manager = require(DIST_DIR + 'elasticsearch/manager').Manager;
        const manager = new Manager(esClient, logger);

        await manager.reset('index_name', mappings);

        expect(esClient.indices.delete).toHaveBeenCalledTimes(1);
        expect(esClient.indices.delete).toHaveBeenCalledWith({ index: 'index_name', ignore: [404] });

        expect(esClient.indices.create).toHaveBeenCalledWith({ index: 'index_name', body: { mappings } });
        expect(esClient.indices.create).toHaveBeenCalledTimes(1);
    });

    it('should log error', async () => {
        const esClient = {
            indices: {
                delete: jasmine.createSpy('indices.delete').and.callFake(() => {
                    throw new Error('error');
                }),
                create: jasmine.createSpy('indices.create')
            }
        };
        const mappings = { property: "value" };
        const logger = { error: jasmine.createSpy('logger.error') };

        const Manager = require(DIST_DIR + 'elasticsearch/manager').Manager;
        const manager = new Manager(esClient, logger);

        await manager.reset('index_name', mappings);

        expect(esClient.indices.delete).toHaveBeenCalledTimes(1);
        expect(esClient.indices.create).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledTimes(1);
    });
});
