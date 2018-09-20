import {Logger} from "../utils/logger";
import {Manager} from "../elasticsearch/manager";
import {FileReader} from "../utils/file-reader";

const fs = require('fs');
const yaml = require('js-yaml');
const esClient = require('../elasticsearch/client');
const logger = Logger.init('CMD-ES-UPDATE');
const esManager = new Manager(esClient, logger);
const fileReader = new FileReader();

const mappingsPath = __dirname + '/../../config/mappings';
const settingsPath = __dirname + '/../../config/es_settings.yml';

try {
    const settings = yaml.safeLoad(fs.readFileSync(settingsPath, 'utf8'));
    const mappings = fileReader.load(mappingsPath);

    (async function () {
        for (let definition of mappings) {
            const [name, mapping] = definition;
            await esManager.update(name, mapping, settings);
        }
    })();
} catch (error) {
    logger.error(error);
}
