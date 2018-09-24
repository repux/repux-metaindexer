# Running

## Initialize project:

Start docker containers
```
./exec up
```

Initialize services
```
./exec init
```
## Configuration

Configuration is in config/config.\<env\>.js file.

## Indexing products data

To get the indexer running you have to run an ETH listener which will listen to the ETH events and enqueue them on an RabbitMQ server.
Execute the following command to run the listener:
```
./exec eth-listener
```
Next, run the consumer which will fetch enqueued events and update products data by getting them from blockchain and IPFS:
```
./exec eth-consumer
```

## ElasticSearch proxy

By default the proxy will listen on port 9001.
```
./exec es-proxy
```

## Useful commands

just run this for list of commands
```
./exec
```

## Testing

```
./exec test
```

## Contribution
We are using [semantic-release](https://github.com/semantic-release/semantic-release) to make semantic versioning easier.
This tool requires special commit message convention taken from Angular to determine the type of changes in repository.
You can read more about Angular commit message conventions [here](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).
Please follow this conventions when you contributing.

## Releasing new version
To release new library version checkout master branch and run `GH_TOKEN=YOUR-GITHUB-PERSONAL-ACCESS-TOKEN NPM_TOKEN=YOUR-NPM-TOKEN yarn release` command.
You can also add GH_TOKEN and NPM_TOKEN environment variable to your .bashrc file and then simply run `yarn release` command.
Semantic-release needs access to at least GitHub **repo** scope. If you don't know how to generate your personal token, please read
[this article](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/). You also have to generate NPM_TOKEN. This
token is used only to preparing package.json file. Library won't be published to NPM repository until you add "@semantic-release/npm" to **publish** section
in `.releaserc` file.
