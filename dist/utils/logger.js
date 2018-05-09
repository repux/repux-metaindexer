"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require('winston');
const path = require('path');
class Logger {
    static init(customLabel) {
        const myFormat = winston.format.printf((info) => {
            return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
        });
        const logPath = path.join(__dirname, '../', 'logs');
        return winston.createLogger({
            level: 'info',
            format: winston.format.combine(winston.format.label({ label: customLabel }), winston.format.timestamp(), myFormat),
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
exports.Logger = Logger;
module.exports = Logger;
