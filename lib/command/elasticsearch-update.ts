import {Logger} from "../utils/logger";
import {Manager} from "../elasticsearch/manager";

const config = require('../../config/config');
const fs = require('fs');
const yaml = require('js-yaml');
const esClient = require('../elasticsearch/client');
const logger = Logger.init('CMD-ES-UPDATE');
const esManager = new Manager(esClient, logger);

const mappingsPath = __dirname + '/../../config/es_mappings.yml';
const settingsPath = __dirname + '/../../config/es_settings.yml';

try {
    const mappings = yaml.safeLoad(fs.readFileSync(mappingsPath, 'utf8'));
    const settings = yaml.safeLoad(fs.readFileSync(settingsPath, 'utf8'));

    esManager.update(config.elasticsearch.index, mappings, settings);
} catch (error) {
    logger.error(error);
}
