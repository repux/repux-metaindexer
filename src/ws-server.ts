import {Logger} from "./utils/logger";
import {SocketIoServer} from "./socketio/server";

const config = require('../config/config');
const wsLogger = Logger.init('WS-SERVER');

const wsServer = new SocketIoServer(
  config.socketio.host,
  parseInt(config.socketio.port),
  config.socketio.path,
  config.socketio.serveClient,
  wsLogger,
  config.socketio.ssl
);
