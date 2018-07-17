"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const http_1 = require("http");
const https_1 = require("https");
const socketIo = require("socket.io");
class SocketIoServer {
    constructor(port, path, serveClient, logger, ssl) {
        this.port = port;
        this.path = path;
        this.serveClient = serveClient;
        this.logger = logger;
        this.ssl = ssl;
        this.createServer();
        this.sockets();
        this.listen();
    }
    createServer() {
        if (parseInt(this.ssl.enabled) === 1) {
            const privateKey = fs.readFileSync(this.ssl.key, 'utf8');
            const certificate = fs.readFileSync(this.ssl.cert, 'utf8');
            const options = {
                key: privateKey,
                cert: certificate,
                passphrase: this.ssl.pass,
            };
            this.server = https_1.createServer(options);
        }
        else {
            this.server = http_1.createServer();
        }
    }
    sockets() {
        this.io = socketIo(this.server);
        this.io.path(this.path);
        this.io.serveClient(this.serveClient);
    }
    listen() {
        this.server.listen(this.port, () => this.logger.info('Running server on port %s', this.port));
        this.io.on('connect', (socket) => {
            this.logger.info('Connected client on port %s with id %s.', this.port, socket.id);
            socket.on('disconnect', () => this.logger.info('Disconnected client with id %s.', socket.id));
        });
    }
    sendDataProductUpdate(data) {
        this.send('dataProductUpdate', data);
    }
    send(event, data) {
        this.io.emit(event, data);
    }
}
exports.SocketIoServer = SocketIoServer;
module.exports.SocketIoServer = SocketIoServer;
