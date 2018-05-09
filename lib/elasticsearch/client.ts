const config = require('../../config/config');
const elasticsearch = require('elasticsearch');

module.exports = new elasticsearch.Client({
    host: config.elasticsearch.host,
    log: 'trace'
});

export {};
