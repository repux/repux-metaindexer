export class EthLogsUtils {
    public static parseLog(log: any, decoders: Array<any>): {} {
        const firstTopic = log.topics[0].replace('0x', '');
        const decoder = decoders.find((decoder: any) => decoder.signature() === firstTopic);

        if (decoder) {
            return decoder.decode(log);
        }

        return null;
    };
}

module.exports.EthLogsUtils = EthLogsUtils;
