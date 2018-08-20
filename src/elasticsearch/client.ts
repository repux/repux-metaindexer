const config = require('../../config/config');
const elasticsearch = require('elasticsearch');

export const ESClient = new elasticsearch.Client({
    host: config.elasticsearch.host,
    log: config.elasticsearch.log || 'error'
});

module.exports = ESClient;
