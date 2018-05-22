import {Logger} from "./utils/logger";

const config = require('../config/config');
const http = require('http');
const httpProxy = require('http-proxy');

const logger = Logger.init('ES-PROXY');
const proxy = httpProxy.createProxyServer({});
const esBaseUrl = config.elasticsearch.protocol + '://' + config.elasticsearch.host;

console.log('listening on:', config.elasticsearch.proxy.port);

try {
    const server = http.createServer(handleRequest);

    proxy.on('error', (error: any, req: any, res: any) => {
        logger.error(error, req, res);
    });
    server.listen(config.elasticsearch.proxy.port);
} catch (e) {
    logger.error(e);
}

function handleRequest(req: any, res: any) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD');

    if (isRequestAllowed(req)) {
        proxy.web(req, res, { target: esBaseUrl });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found.');
    }
}

function isRequestAllowed(req: any) {
    let pathRegExp = new RegExp('^/' + config.elasticsearch.index + '/\\w+');

    return ['GET', 'HEAD'].includes(req.method) && req.url.match(pathRegExp);
}

export {};
