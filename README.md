# Getting Started
```sh
brew install aptos


# 1. Setting up the localnet

## Run a local network
aptos node run-local-testnet --with-indexer-api

## Set up the profile
## After running the above command, you will see a message like this: "Setup is complete, you can now use the local testnet!"
aptos init --profile local --network local

## Resetting the local network (Clean the state and start with a new chain at genesis)
aptos node run-local-testnet --with-indexer-api --force-restart 

## Publish Move modules to the local testnet
aptos move publish --profile local --package-dir /opt/git/aptos-core/aptos-move/move-examples/hello_blockchain --named-addresses HelloBlockchain=local
```

* Node API: This is a REST API that runs directly on the node. It enables core write functionality such as transaction submission and a limited set of read functionality, such as reading account resources or Move module information.
* Indexer API: This is a GraphQL API that provides rich read access to indexed blockchain data. If you click on the URL for the Indexer API above, by default http://127.0.0.1:8090, it will open the Hasura Console. This is a web UI that helps you query the Indexer GraphQL API.
  * Postgres: This is the database that the indexer processors write to. The Indexer API reads from this database.
* Faucet: You can use this to create accounts and mint APT on your local network.
* Transaction Stream Service: This is a grpc stream of transactions. This is relevant to you if you are developing a custom processor.


# Concepts
## Epoch
A validator leader is selected by a deterministic formula based on the validator reputation determined by validator's performance (including whether the validator has voted in the past or not) and stake. This leader selection is not done by voting.
The selected leader sends a proposal containing the collected quorum votes of the previous proposal and the leader's proposed order of transactions for the new block.

All the validators from the validator set will vote on the leader's proposal for the new block. Once consensus is reached, the block can be finalized. Hence, the actual list of votes to achieve consensus is a subset of all the validators in the validator set. This leader validator is rewarded. Rewards are given only to the leader validator, not to the voter validators.
The above flow repeats with the selection of another validator leader and repeating the steps for the next new block. Rewards are given at the end of the epoch.

## Block height & Ledger version
Ledger version이 통상적으로 다른 메인넷에서 사용하는 block height 개념. Aptos에서 block은 트랜잭션들을 일괄 처리하는 단위.


## Transaction
아래 조건을 만족하면 유효한 트랜잭션.
* The transaction has a valid signature.
* An account exists at the sender address.
* It includes a public key, and the hash of the public key matches the sender account's authentication key.
* The sequence number of the transaction matches the sender account's sequence number.
* The sender account's balance is greater than the maximum gas amount.
* The expiration time of the transaction has not passed.


## Account
Aptos Move accounts have a public address, an authentication key, a public key, and a private key. The public address is permanent, always matching the account's initial authentication key.

The Aptos account model facilitates the unique ability to rotate an account's private key. Since an account's address is the initial authentication key, the ability to sign for an account can be transferred to another private key without changing its public address.