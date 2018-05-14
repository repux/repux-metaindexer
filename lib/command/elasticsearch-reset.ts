const config = require('../../config/config');
const fs = require('fs');
const yaml = require('js-yaml');
const esClient = require('../elasticsearch/client');
const ESManager = require('../elasticsearch/manager');
const logger = require('./utils/logger').init('CMD-ES-RESET');

let args = require('minimist')(process.argv.slice(2));
let esManager = new ESManager(esClient, logger);

try {
    let mappings = yaml.safeLoad(fs.readFileSync(args.mappings, 'utf8'));

    esManager.reset(config.elasticsearch.index, mappings);
} catch (error) {
    logger.error(error);
}
