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
        fs.writeFile(this.lastBlockFilepath, blockNumber, {flag: 'w'}, (err: any) => {

        });
    }

    async watch(web3: any, lastBlockSaveInterval: number) {
        setInterval(
            () => this.write(web3.eth.blockNumber),
            lastBlockSaveInterval
        );
    }
}

module.exports.LastBlock = LastBlock;
