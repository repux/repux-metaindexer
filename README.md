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

To get docker machine name type:
```
docker-machine ls
```

## Configuration

Configuration is in config/config.\<env\>.js file.
If config/config.js.dist will change just run `./exec update-config [env=dev]` to add new values.

## Indexing products data

To run the indexer just type:
```
./exec eth-listener
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
