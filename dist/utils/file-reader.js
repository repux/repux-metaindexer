"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
class FileReader {
    load(dirPath) {
        this.dirPath = dirPath;
        this.contents = new Map();
        fs.readdirSync(dirPath).forEach((file) => {
            this.loadFile(file);
        });
        return this.contents;
    }
    loadFile(file) {
        let stat, parsed, mappings;
        const filePath = this.dirPath + '/' + file;
        stat = fs.statSync(filePath);
        parsed = path.parse(filePath);
        if (stat.isDirectory()) {
            this.loadFile(filePath);
        }
        else if (parsed.ext === '.yml') {
            mappings = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
            this.contents.set(parsed.name, mappings);
        }
    }
}
exports.FileReader = FileReader;
module.exports.FileReader = FileReader;
