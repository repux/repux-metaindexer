"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('../../config/config');
const elasticsearch = require('elasticsearch');
module.exports = new elasticsearch.Client({
    host: config.elasticsearch.host,
    log: 'error'
});
