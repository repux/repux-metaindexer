import * as fs from 'fs';
import {createServer, Server} from 'http';
import {createServer as sslCreateServer, Server as sslServer}  from 'https';
import * as socketIo from 'socket.io';

export class SocketIoServer {
    private server: Server | sslServer;
    private io: SocketIO.Server;
    private isSslEnabled: boolean;

    constructor(
        private host: string,
        private port: string | number,
        private path: string,
        private serveClient: boolean,
        private logger: any,
        private ssl: any,
    ) {
        this.isSslEnabled = parseInt(this.ssl.enabled) === 1;
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createServer(): void {
        if (this.isSslEnabled) {
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
        this.server.listen({
            host: this.host,
            port: this.port
          },
          () => this.logger.info('Running WS server on %s://%s:%s',
              this.isSslEnabled ? 'https' : 'http',
              this.host,
              this.port
          )
        );

        this.io.on('connect', (socket: any) => {
            this.logger.info('Connected WS client on port %s with id %s.', this.port, socket.id);

            socket.on('disconnect', () => this.logger.info('Disconnected WS client with id %s.', socket.id));
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
