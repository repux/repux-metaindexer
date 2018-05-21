import {Logger} from "../utils/logger";
import {Manager} from "../elasticsearch/manager";

const config = require('../../config/config');
const fs = require('fs');
const yaml = require('js-yaml');
const esClient = require('../elasticsearch/client');

const logger = Logger.init('CMD-ES-RESET');

let args = require('minimist')(process.argv.slice(2));
let esManager = new Manager(esClient, logger);

try {
    let mappings = yaml.safeLoad(fs.readFileSync(args.mappings, 'utf8'));

    esManager.reset(config.elasticsearch.index, mappings);
} catch (error) {
    logger.error(error);
}
