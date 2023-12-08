- [Getting Started](#getting-started)
- [Concepts](#concepts)
  - [Epoch](#epoch)
  - [Block height \& Ledger version](#block-height--ledger-version)
  - [Transaction](#transaction)
  - [Account](#account)
  - [Asset type](#asset-type)
    - [Coin](#coin)
    - [Aptos Token](#aptos-token)
    - [Fungible Asset](#fungible-asset)
    - [Digital Asset](#digital-asset)


# Getting Started

## Setup localnet
```sh
brew install aptos

## Run a local network
aptos node run-local-testnet --with-indexer-api

## Set up the profile
## After running the above command, you will see a message like this: "Setup is complete, you can now use the local testnet!"
aptos init --profile local --network local

## Resetting the local network (Clean the state and start with a new chain at genesis)
aptos node run-local-testnet --with-indexer-api --force-restart 
```

* Node API: This is a REST API that runs directly on the node. It enables core write functionality such as transaction submission and a limited set of read functionality, such as reading account resources or Move module information.
* Indexer API: This is a GraphQL API that provides rich read access to indexed blockchain data. If you click on the URL for the Indexer API above, by default http://127.0.0.1:8090, it will open the Hasura Console. This is a web UI that helps you query the Indexer GraphQL API.
  * Postgres: This is the database that the indexer processors write to. The Indexer API reads from this database.
* Faucet: You can use this to create accounts and mint APT on your local network.
* Transaction Stream Service: This is a grpc stream of transactions. This is relevant to you if you are developing a custom processor.

## Build Move contract
```sh
# Using CLI
## Compile Move modules
aptos move compile --package-dir contracts/hello_world --named-addresses tester="your address"

## Publish Move modules to the local testnet
aptos move publish --package-dir contracts/hello_world --named-addresses tester="your address" --private-key-file .secrets/privKey --url http://127.0.0.1:8080
# Using Typescript SDK

```

# Concepts
## Epoch
A validator leader is selected by a deterministic formula based on the validator reputation determined by validator's performance (including whether the validator has voted in the past or not) and stake. This leader selection is not done by voting.
The selected leader sends a proposal containing the collected quorum votes of the previous proposal and the leader's proposed order of transactions for the new block.

All the validators from the validator set will vote on the leader's proposal for the new block. Once consensus is reached, the block can be finalized. Hence, the actual list of votes to achieve consensus is a subset of all the validators in the validator set. This leader validator is rewarded. Rewards are given only to the leader validator, not to the voter validators.
The above flow repeats with the selection of another validator leader and repeating the steps for the next new block. Rewards are given at the end of the epoch.

## Block height & Ledger version
Ledger version이 통상적으로 다른 메인넷에서 사용하는 block height 개념. Aptos에서 block은 트랜잭션들을 일괄 처리하는 단위. In Aptos, each transaction is committed as a distinct version to the blockchain. This allows for the convenience of sharing committed transactions by their version number.


## Transaction
아래 조건을 만족하면 유효한 트랜잭션.
* The transaction has a valid signature.
* An account exists at the sender address.
* It includes a public key, and the hash of the public key matches the sender account's authentication key.
* The sequence number of the transaction matches the sender account's sequence number.
* The sender account's balance is greater than the maximum gas amount.
* The expiration time of the transaction has not passed.


## Account
Aptos Move accounts have a public address, an authentication key, a public key, and a private key. The public address is permanent, always matching the account's initial authentication key. Account addresses are 32-bytes. They are usually shown as 64 hex characters

* Native outstanding features
  * Rotating authentication key. The Aptos account model facilitates the unique ability to rotate an account's private key. Since an account's address is the initial authentication key, the ability to sign for an account can be transferred to another private key without changing its public address. This is similar to changing passwords in the web2 world.
  * Native multisig support. Accounts on Aptos support k-of-n multisig using both Ed25519 and Secp256k1 ECDSA signature schemes when constructing the authentication key.

* [type](https://aptos.dev/concepts/accounts/)
  * Standard account - This is a typical account corresponding to an address with a corresponding pair of public/private keys.
  * Resource account - An autonomous account without a corresponding private key used by developers to store resources or publish modules on-chain.
  * Object - A complex set of resources stored within a single address representing a single entity.

The state of each account comprises both the code (Move modules) and the data (Move resources). An account may contain an arbitrary number of Move modules and Move resources:
* Move modules: Move modules contain code, for example, type and procedure declarations; but they do not contain data. A Move module encodes the rules for updating the Aptos blockchain's global state.
* Move resources: Move resources contain data but no code. Every resource value has a type that is declared in a module published on the Aptos blockchain.

## Asset type
### Coin
[go to](https://github.com/aptos-labs/aptos-core/blob/main/aptos-move/framework/aptos-framework/sources/coin.move)  
legacy fungible token:  
Every coin is defined by its <CoinType>. Developers don’t need to deploy a separate smart contract for each new asset as you would on Ethereum. Instead, there is a generic token contract, and all one has to do is run some commands. 

### Aptos Token
[go to](https://github.com/aptos-labs/aptos-core/blob/main/aptos-move/framework/aptos-token/sources/token.move)  
legacy NFT:  
It covers NFT, fungible tokens without decimals, and semi-fungible tokens (SFTs)

### Fungible Asset
[go to](https://github.com/aptos-labs/aptos-core/blob/main/aptos-move/framework/aptos-framework/sources/fungible_asset.move)  
new fungible token standard:  
It's launched in August 2023. Beyond regular fungible tokens, it can be used for tokenized real estate, stocks, and other real-world assets (RWA), event tickets, in-game currency and characters, and more. The standard supports fractionalized ownership and even allows developers to determine who can own an asset (ownership control).

Whereas Aptos Coin used the account resources data model, the Fungible Asset standard uses the object model. Without getting too technical (you can read about Move resources vs. objects here),  an object can represent a complex asset with various sorts of data, all stored within a single address. This approach saves gas and provides creators with better control over the asset’s features and ownership. Also, end users don’t need to register a fungible asset before they can transact with it. Right now, Alice can’t send Bob token X unless he has already registered it; but with the Fungible Asset standard, a primary FungibleStore object will be automatically created in Bob’s account if Alice has initiated a deposit to his address.

### Digital Asset
[go to](https://github.com/aptos-labs/aptos-core/blob/main/aptos-move/framework/aptos-token-objects/sources/aptos_token.move)  
new NFT standard:  
It's launched in August 2023. Like the new Fungible Asset standard, Digital Assets make use of the object model. A collection is an object with its own address and various resources, and so is each token within a collection. **every NFT has its own address** on the Aptos blockchain, so you manipulate it individually and add properties to it. Creating a Digital Asset starts with a new collection that has either a fixed or an unlimited supply, a name, a description, a URI, and a royalty setting. You can create many collections under the same account, but they must have different names. Within a collection, tokens can be named or unnamed. Named tokens (created with create_named_token and specifying a name) have deterministic addresses and are thus easy to query. However, they are impossible to delete completely: burning an NFT will remove the data but not the object itself. On the other hand, unnamed tokens (created with create_from_account) can be burned without a trace. The creator can assign new properties as resources to an existing collection or NFT without changing the core code.

features:
* collections & royalties
* Mutability - changing royalties, URIs, NFT descriptions and properties;
* NFT burning and freezing by the creator;
* Minting a new NFT into an existing collection;
* Minting a soulbound token to a recipient account (NFTs that can’t be transferred out of an account)
* Users don’t need to allow token transfers before they can receive NFTs
* Adding a timestamp to limit the time window
* Several NFTs can be combined (composability)
* Etc.
