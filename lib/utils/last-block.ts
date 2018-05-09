const fs = require('fs');

export class LastBlock {
    /**
     *
     * @param {integer} defaultStartBlock
     * @param {string} lastBlockFilepath
     * @param {Object} logger
     */
    constructor(private defaultStartBlock: number, private lastBlockFilepath: String, private logger: any) {
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
    write(blockNumber: number) {
        fs.writeFile(this.lastBlockFilepath, blockNumber, {flag: 'w'}, (err: any) => {

        });
    }

    /**
     *
     * @param {Object} web3
     * @param {integer} lastBlockSaveInterval
     */
    async watch(web3: any, lastBlockSaveInterval: number) {
        setInterval(
            () => this.write(web3.eth.blockNumber),
            lastBlockSaveInterval
        );
    }
}

module.exports = LastBlock;
