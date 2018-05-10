const ROOT_DIR = './../../../';
const DIST_DIR = ROOT_DIR + 'dist/';

const assert = require('assert');
const mock = require('mock-require');
const sinon = require('sinon');

afterEach(function () {
    mock.stopAll();
});

describe('Manager', function () {
    it('should reset an index', async () => {
        const esClient = {
            indices: {
                delete: sinon.stub(),
                create: sinon.stub(),
            }
        };
        const mappings = { property: "value" };

        esClient.indices.delete.callsFake((data) => {
            assert.equal(data.index, 'index_name');
        });

        esClient.indices.create.callsFake((data) => {
            assert.equal(data.index, 'index_name');
            assert.deepEqual(data.body, { mappings });
        });

        const Manager = require(DIST_DIR + 'elasticsearch/manager');
        const manager = new Manager(esClient);

        await manager.reset('index_name', mappings);

        assert(esClient.indices.delete.called, 'delete should be called');
        assert(esClient.indices.create.called, 'create should be called');
    });
});
