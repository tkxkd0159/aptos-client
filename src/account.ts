import { Account, Secp256k1PrivateKey } from '@aptos-labs/ts-sdk'

const seed = "b23bc4fba89a643cdd3ceb43b1b996c7f5a797b0abd84c3ab900a25319c09c06"

function getTestAccount() {
    const privateKey = new Secp256k1PrivateKey(seed);
    const account = Account.fromPrivateKey({ privateKey });
    return account;
}

export {
    getTestAccount
}