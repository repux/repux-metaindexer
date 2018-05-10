"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extend = require("extend");
const fs = require('fs');
const util = require('util');
const dist = require('../../config/config.js.dist');
const current = require('../../config/config.js');
process.stdout.write('ENV: ' + current.env + "\n");
process.stdout.write('Merging configs files...');
let finalConfig = extend(dist, current);
process.stdout.write(" done.\n");
process.stdout.write('Saving new config file...');
fs.writeFileSync('./config/config.' + current.env + '.js', formatConfig(finalConfig));
process.stdout.write(" done.\n");
function formatConfig(config) {
    return util.format("const config = %s;\nmodule.exports = config;\n", JSON.stringify(config, null, 4));
}
