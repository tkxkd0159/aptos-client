# Getting Started
```sh
brew install aptos


# 1. Setting up the localnet

aptos node run-local-testnet --with-indexer-api

aptos init --profile local --network local

## Resetting the local network
aptos node run-local-testnet --force-restart 

## Publish Move modules to the local testnet
aptos move publish --profile local --package-dir /opt/git/aptos-core/aptos-move/move-examples/hello_blockchain --named-addresses HelloBlockchain=local
```

* Node API: This is a REST API that runs directly on the node. It enables core write functionality such as transaction submission and a limited set of read functionality, such as reading account resources or Move module information.
* Indexer API: This is a GraphQL API that provides rich read access to indexed blockchain data. If you click on the URL for the Indexer API above, by default http://127.0.0.1:8090, it will open the Hasura Console. This is a web UI that helps you query the Indexer GraphQL API.
  * Postgres: This is the database that the indexer processors write to. The Indexer API reads from this database.
* Faucet: You can use this to create accounts and mint APT on your local network.
* Transaction Stream Service: This is a grpc stream of transactions. This is relevant to you if you are developing a custom processor.
