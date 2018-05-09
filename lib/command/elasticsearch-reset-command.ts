const config = require('../../config/config');
const yaml = require('js-yaml');
const fs = require('fs');
const esClient = require('../elasticsearch/client');

let args = require('minimist')(process.argv.slice(2));

try {
    let mappings = yaml.safeLoad(fs.readFileSync(args.mappings, 'utf8'));

    esClient.indices.delete({
        index: config.elasticsearch.index,
        ignore: [404]
    })
        .then(
            () => {
                esClient.indices.create({
                    index: config.elasticsearch.index,
                    body: { mappings }
                }, (res: any) => {
                    console.log(res);
                });
            }
        );
} catch (error) {
    console.log(error);
}
