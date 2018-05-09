"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
class LastBlock {
    /**
     *
     * @param {integer} defaultStartBlock
     * @param {string} lastBlockFilepath
     * @param {Object} logger
     */
    constructor(defaultStartBlock, lastBlockFilepath, logger) {
        this.defaultStartBlock = defaultStartBlock;
        this.lastBlockFilepath = lastBlockFilepath;
        this.logger = logger;
    }
    /**
     * @returns {integer}
     */
    read() {
        let startBlock = this.defaultStartBlock;
        if (fs.existsSync(this.lastBlockFilepath)) {
            startBlock = fs.readFileSync(this.lastBlockFilepath, {
                encoding: 'utf8'
            });
        }
        return startBlock;
    }
    /**
     *
     * @param {integer} blockNumber
     */
    write(blockNumber) {
        fs.writeFile(this.lastBlockFilepath, blockNumber, { flag: 'w' }, (err) => {
        });
    }
    /**
     *
     * @param {Object} web3
     * @param {integer} lastBlockSaveInterval
     */
    async watch(web3, lastBlockSaveInterval) {
        setInterval(() => this.write(web3.eth.blockNumber), lastBlockSaveInterval);
    }
}
exports.LastBlock = LastBlock;
module.exports = LastBlock;
