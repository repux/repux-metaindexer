const fs = require('fs');

export class LastBlock {

    constructor(private defaultStartBlock: number, private lastBlockFilepath: string) {
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

    write(blockNumber: number) {
        fs.writeFileSync(this.lastBlockFilepath, blockNumber, {flag: 'w'});
    }
}

module.exports.LastBlock = LastBlock;
