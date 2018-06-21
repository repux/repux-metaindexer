const fs = require('fs');

let args = require('minimist')(process.argv.slice(2));
let env = args.env || process.env.NODE_ENV || 'dev';

let config = {};

if (fs.existsSync(__dirname + '/config.' + env + '.js')) {
    config = require('./config.' + env + '.js');
}

config.env = env;

module.exports = config;
