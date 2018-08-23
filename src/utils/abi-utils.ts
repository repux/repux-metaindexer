const SolidityEvent = require("web3/lib/web3/event.js");

export class AbiUtils {
    public static getEventsDecoders(abi: any): Array<any> {
        return abi
            .filter((json: any) => json.type === 'event')
            .map((json: any) => new SolidityEvent(null, json, null));
    }
}

module.exports.AbiUtils = AbiUtils;
