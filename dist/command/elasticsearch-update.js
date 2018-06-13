"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const manager_1 = require("../elasticsearch/manager");
const config = require('../../config/config');
const fs = require('fs');
const yaml = require('js-yaml');
const esClient = require('../elasticsearch/client');
const logger = logger_1.Logger.init('CMD-ES-UPDATE');
const esManager = new manager_1.Manager(esClient, logger);
const mappingsPath = __dirname + '/../../config/es_mappings.yml';
const settingsPath = __dirname + '/../../config/es_settings.yml';
try {
    const mappings = yaml.safeLoad(fs.readFileSync(mappingsPath, 'utf8'));
    const settings = yaml.safeLoad(fs.readFileSync(settingsPath, 'utf8'));
    esManager.update(config.elasticsearch.index, mappings, settings);
}
catch (error) {
    logger.error(error);
}
