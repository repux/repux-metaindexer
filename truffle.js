module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: '1000' // Match any network id
        }
    },
    contracts_build_directory: __dirname + '/contracts',
    contracts_directory: __dirname + '/node_modules/@repux/repux-smart-contracts/contracts'
};
