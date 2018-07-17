"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./utils/logger");
const config = require('../config/config');
const isSslEnabled = parseInt(config.elasticsearch.proxy.ssl.enabled) === 1;
const http = isSslEnabled
    ? require('https')
    : require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const logger = logger_1.Logger.init('ES-PROXY');
const proxy = httpProxy.createProxyServer({});
const esBaseUrl = config.elasticsearch.protocol + '://' + config.elasticsearch.host;
let httpServerOptions = {};
if (isSslEnabled) {
    const privateKey = fs.readFileSync(config.elasticsearch.proxy.ssl.key, 'utf8');
    const certificate = fs.readFileSync(config.elasticsearch.proxy.ssl.cert, 'utf8');
    httpServerOptions = {
        key: privateKey,
        cert: certificate,
        passphrase: config.elasticsearch.proxy.ssl.pass
    };
}
try {
    const server = http.createServer(httpServerOptions, handleRequest);
    proxy.on('error', (error, req, res) => {
        logger.error(error, req, res);
    });
    server.listen({
        host: config.elasticsearch.proxy.host,
        port: config.elasticsearch.proxy.port
    });
    const protocol = isSslEnabled ? 'https' : 'http';
    logger.info('listening on: ' + protocol + '://' + config.elasticsearch.proxy.host + ':' + config.elasticsearch.proxy.port);
}
catch (e) {
    logger.error(e);
}
function handleRequest(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
    if (isRequestAllowed(req)) {
        proxy.web(req, res, { target: esBaseUrl });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found.');
    }
}
function isRequestAllowed(req) {
    let pathRegExp;
    if (!['GET', 'HEAD'].includes(req.method)) {
        return false;
    }
    Object.entries(config.elasticsearch.indexes).forEach(([key, indexName]) => {
        pathRegExp = new RegExp('^/' + indexName + '/\\w+');
        if (req.url.match(pathRegExp)) {
            return true;
        }
    });
    return false;
}
