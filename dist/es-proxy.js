"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./utils/logger");
const config = require('../config/config');
const http = require('http');
const httpProxy = require('http-proxy');
const logger = logger_1.Logger.init('ES-PROXY');
const proxy = httpProxy.createProxyServer({});
const esBaseUrl = config.elasticsearch.protocol + '://' + config.elasticsearch.host;
console.log('listening on:', config.elasticsearch.proxy.port);
try {
    const server = http.createServer(handleRequest);
    proxy.on('error', (error, req, res) => {
        logger.error(error, req, res);
    });
    server.listen(config.elasticsearch.proxy.port);
}
catch (e) {
    logger.error(e);
}
function handleRequest(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD');
    if (isRequestAllowed(req)) {
        proxy.web(req, res, { target: esBaseUrl });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found.');
    }
}
function isRequestAllowed(req) {
    let pathRegExp = new RegExp('^/' + config.elasticsearch.index + '/\\w+');
    return ['GET', 'HEAD'].includes(req.method) && req.url.match(pathRegExp);
}
