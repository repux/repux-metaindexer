"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const manager_1 = require("../elasticsearch/manager");
const config = require('../../config/config');
const fs = require('fs');
const yaml = require('js-yaml');
const esClient = require('../elasticsearch/client');
const logger = logger_1.Logger.init('CMD-ES-RESET');
let args = require('minimist')(process.argv.slice(2));
let esManager = new manager_1.Manager(esClient, logger);
try {
    let mappings = yaml.safeLoad(fs.readFileSync(args.mappings, 'utf8'));
    esManager.reset(config.elasticsearch.index, mappings);
}
catch (error) {
    logger.error(error);
}
