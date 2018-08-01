const config = {
    startBlock: 0,
    registryAddress: process.env.METAINDEXER_REGISTRY_ADDRESS || '0xc2d327375dd73b132d1171aadf7a205d3a9b7d8f',
    tokenAddress: process.env.METAINDEXER_TOKEN_ADDRESS || '0xbd83c21e6f0a9547abe908c6faa02a55512d57b4',
    tokenContractName: 'DemoToken',
    ethereumHost: process.env.METAINDEXER_ETHEREUM_URL || 'http://repux-indexer-ganache-cli:8545',
    lastBlockSaveInterval: 5000,
    elasticsearch: {
        host: process.env.METAINDEXER_ELASTICSEARCH_HOST_WITH_PORT || 'repux-indexer-es:9200',
        protocol: 'http',
        indexes: {
            dataProduct: 'data_product',
            dataProductEvent: 'data_product_event',
            user: 'user'
        },
        log: 'error',
        proxy: {
            host: process.env.METAINDEXER_ESPROXY_HOST || 'localhost',
            port: process.env.METAINDEXER_ESPROXY_PORT || 9201,
            ssl: {
                enabled: process.env.METAINDEXER_ESPROXY_SSL || 0,
                key: process.env.METAINDEXER_ESPROXY_SSL_KEY || null,
                cert: process.env.METAINDEXER_ESPROXY_SSL_CERT || null
            }
        }
    },
    ipfs: {
        httpUrl: process.env.METAINDEXER_IPFS_HTTP_URL || 'http://repux-indexer-ipfs:8080',
        maxMetaFileSize: process.env.METAINDEXER_IPFS_MAX_META_FILE_SIZE || 512000
    },
    socketio: {
        host: process.env.METAINDEXER_SOCKETIO_HOST || null,
        port: process.env.METAINDEXER_SOCKETIO_PORT || 3000,
        path: process.env.METAINDEXER_SOCKETIO_PATH || '/socket.io',
        serveClient: process.env.METAINDEXER_SOCKETIO_SERVE || false,
        ssl: {
            enabled: process.env.METAINDEXER_SOCKETIO_SSL || 0,
            key: process.env.METAINDEXER_SOCKETIO_SSL_KEY || null,
            cert: process.env.METAINDEXER_SOCKETIO_SSL_CERT || null
        }
    },
    categorySeparator: '>',
    ratings: {
        gamma: process.env.METAINDEXER_RATINGS_GAMMA || 400,
        alpha: process.env.METAINDEXER_RATINGS_ALPHA || 0.3
    }
};

module.exports = config;
