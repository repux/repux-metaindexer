import * as http from "http"
import * as https from "https"
import {Logger} from "winston"
import * as fs from "fs";

export class WsNotifier {
  readonly options: any;
  private httpClient: any;

  constructor(config: any, logger: Logger) {
    this.options = {
      host: config.host,
      port: config.port,
      path: '/notify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': config.apiKey
      }
    };

    const isSsl = parseInt(config.ssl.enabled);
    if (isSsl) {
      this.options.protocol = 'https:';
      this.options.key = fs.readFileSync(config.ssl.key, 'utf8');
      this.options.cert = fs.readFileSync(config.ssl.cert, 'utf8');
      this.options.rejectUnauthorized = false;
    }

    this.httpClient = isSsl ? https : http;

    logger.info('[init] Connection set to ws-server: %s://%s:%s',
      isSsl ? 'https' : 'http',
      config.host,
      config.port
    );
  }

  public notify(data: any) {
    const request = this.httpClient.request(this.options, (response: any) => {
      let responseString = "";

      response.on('data', (responseData: any) => {
        responseString += responseData;
      });
      response.on('end', () => {
      });
    });

    request.write(JSON.stringify(data));
    request.end();
  }
}

module.exports.WsNotifier = WsNotifier;
