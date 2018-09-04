import * as http from "http"

export class WsNotifier {
  readonly options: any;

  constructor(private host: string, private port: number) {
    this.options = {
      host: host,
      port: port,
      path: "/notify",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    };
  }

  public notify(data: any) {
    const request = http.request(this.options, (response: any) => {
      let responseString = "";

      response.on("data", function (responseData: any) {
        responseString += responseData;
      });
      response.on("end", function () {
      });
    });

    request.write(JSON.stringify(data));
    request.end();
  }
}

module.exports.WsNotifier = WsNotifier;
