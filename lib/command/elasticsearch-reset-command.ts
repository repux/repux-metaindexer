const config = require('../../config/config');
const fs = require('fs');
const yaml = require('js-yaml');
const esClient = require('../elasticsearch/client');
const ESManager = require('../elasticsearch/manager');

let args = require('minimist')(process.argv.slice(2));
let esManager = new ESManager(esClient);

try {
    let mappings = yaml.safeLoad(fs.readFileSync(args.mappings, 'utf8'));

    esManager.reset(config.elasticsearch.index, mappings);
} catch (error) {
    console.log(error);
}
