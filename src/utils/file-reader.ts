import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export class FileReader {
    private dirPath: string;
    private contents: Map<string, any>;

    public load(dirPath: string): Map<string, any> {
        this.dirPath = dirPath;
        this.contents = new Map();

        fs.readdirSync(dirPath).forEach((file: any) => {
            this.loadFile(file);
        });

        return this.contents;
    }

    private loadFile(file: any) {
        let stat, parsed, mappings;
        const filePath = this.dirPath + '/' + file;

        stat = fs.statSync(filePath);
        parsed = path.parse(filePath);

        if (stat.isDirectory()) {
            this.loadFile(filePath);
        } else if (parsed.ext === '.yml') {
            mappings = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
            this.contents.set(parsed.name, mappings);
        }
    }
}

module.exports.FileReader = FileReader;
