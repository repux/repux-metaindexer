import {Logger} from "./utils/logger";

const config = require('../config/config');
const http = config.elasticsearch.proxy.ssl.enabled
    ? require('https')
    : require('http');

const httpProxy = require('http-proxy');
const fs = require('fs');

const logger = Logger.init('ES-PROXY');
const proxy = httpProxy.createProxyServer({});
const esBaseUrl = config.elasticsearch.protocol + '://' + config.elasticsearch.host;

let httpServerOptions = {};

if (config.elasticsearch.proxy.ssl.enabled) {
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

    proxy.on('error', (error: any, req: any, res: any) => {
        logger.error(error, req, res);
    });

    server.listen(config.elasticsearch.proxy.port);
    console.log('listening on:', config.elasticsearch.proxy.port);

} catch (e) {
    logger.error(e);
}

function handleRequest(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');

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
