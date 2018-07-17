"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const manager_1 = require("../elasticsearch/manager");
const file_reader_1 = require("../utils/file-reader");
const fs = require('fs');
const yaml = require('js-yaml');
const esClient = require('../elasticsearch/client');
const logger = logger_1.Logger.init('CMD-ES-RESET');
const esManager = new manager_1.Manager(esClient, logger);
const fileReader = new file_reader_1.FileReader();
const mappingsPath = __dirname + '/../../config/mappings';
const settingsPath = __dirname + '/../../config/es_settings.yml';
try {
    const settings = yaml.safeLoad(fs.readFileSync(settingsPath, 'utf8'));
    const mappings = fileReader.load(mappingsPath);
    mappings.forEach((mapping, name) => {
        esManager.reset(name, mapping, settings);
    });
}
catch (error) {
    logger.error(error);
}
