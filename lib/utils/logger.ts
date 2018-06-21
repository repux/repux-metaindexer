const winston = require('winston');
const path = require('path');
const util = require('util');

export class Logger {
    static init(customLabel: string) {
        const myFormat = winston.format.printf((info: any) => {
            const splat = info[Symbol.for('splat')];

            if (splat && splat.length) {
                let params = splat.map((value: any) => {
                    return typeof value === 'object' ? JSON.stringify(value) : value;
                });
                info.message = util.format(info.message, ...params);
            }

            return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
        });
        const logPath = path.join(__dirname, '../', 'logs');

        return winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.label({label: customLabel}),
                winston.format.timestamp(),
                myFormat
            ),
            transports: [
                new winston.transports.File({
                    filename: path.join(logPath, 'error.log'),
                    level: 'error'
                }),
                new winston.transports.File({
                    filename: path.join(logPath, 'info.log')
                }),
                new winston.transports.Console()
            ]
        });
    }
}

module.exports.Logger = Logger;
