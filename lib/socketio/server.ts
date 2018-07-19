import * as fs from 'fs';
import {createServer, Server} from 'http';
import {createServer as sslCreateServer, Server as sslServer}  from 'https';
import * as socketIo from 'socket.io';

export class SocketIoServer {
    private server: Server | sslServer;
    private io: SocketIO.Server;

    constructor(
        private port: string | number,
        private path: string,
        private serveClient: boolean,
        private logger: any,
        private ssl: any,
    ) {
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createServer(): void {
        if (parseInt(this.ssl.enabled) === 1) {
            const privateKey = fs.readFileSync(this.ssl.key, 'utf8');
            const certificate = fs.readFileSync(this.ssl.cert, 'utf8');

            const options = {
                key: privateKey,
                cert: certificate,
                passphrase: this.ssl.pass,
            };

            this.server = sslCreateServer(options);
        } else {
            this.server = createServer();
        }
    }

    private sockets(): void {
        this.io = socketIo(this.server);

        this.io.path(this.path);
        this.io.serveClient(this.serveClient);
    }

    private listen(): void {
        this.server.listen(
            this.port,
            () => this.logger.info('Running server on port %s', this.port)
        );

        this.io.on('connect', (socket: any) => {
            this.logger.info('Connected client on port %s with id %s.', this.port, socket.id);

            socket.on('disconnect', () => this.logger.info('Disconnected client with id %s.', socket.id));
        });
    }

    public sendDataProductUpdate(data: any): void {
        this.send('dataProductUpdate', data);
    }

    public send(event: string, data: any): void {
        this.io.emit(event, data);
    }
}

module.exports.SocketIoServer = SocketIoServer;
