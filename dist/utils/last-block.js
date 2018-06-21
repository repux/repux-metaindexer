"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
class LastBlock {
    constructor(defaultStartBlock, lastBlockFilepath) {
        this.defaultStartBlock = defaultStartBlock;
        this.lastBlockFilepath = lastBlockFilepath;
    }
    read() {
        let startBlock = this.defaultStartBlock;
        if (fs.existsSync(this.lastBlockFilepath)) {
            startBlock = fs.readFileSync(this.lastBlockFilepath, {
                encoding: 'utf8'
            });
        }
        return startBlock;
    }
    write(blockNumber) {
        fs.writeFile(this.lastBlockFilepath, blockNumber, { flag: 'w' }, (err) => {
        });
    }
    async watch(web3, lastBlockSaveInterval) {
        setInterval(() => this.write(web3.eth.blockNumber), lastBlockSaveInterval);
    }
}
exports.LastBlock = LastBlock;
module.exports.LastBlock = LastBlock;
