import {
    Aptos,
    Account, Ed25519PrivateKey, HexInput, AccountAddressInput, AccountAddress, PrivateKey,
    UserTransactionResponse,
} from '@aptos-labs/ts-sdk'

export const SEED = ["b23bc4fba89a643cdd3ceb43b1b996c7f5a797b0abd84c3ab900a25319c09c06", "1f63e5d3babd01b58fbf3974c2c98b553aa3f67a44846895b84a52cda966f65a"]

export function getTestAccount() {
    const privateKey = new Ed25519PrivateKey(SEED[0]);
    const account = Account.fromPrivateKey({ privateKey, legacy: true });
    return account;
}

export class AptosAccount {
    constructor() { }

    /**
     * @description
     * Rotate authentication key of an account. Only legacy Ed25519 scheme is supported for now.
     * @example
     * ```ts
     * const [txResponse, newPrivKey] = await AptosAccount.rotateAuthKey(c.app(), acc, SEED[1]);
     * const newAcc = AptosAccount.getAccountAfterRotate(acc.accountAddress, newPrivKey);
     * // private/public/authentication key are changed without changing account address
     * // you can cehck the rotated authentication_key at same account address in accountData
     * const info = await c.q().accountInfo(acc.accountAddress);
     * ```
     */
    static async rotateAuthKey(app: Aptos, from: Account, seed: HexInput): Promise<[UserTransactionResponse, Ed25519PrivateKey]> {
        const privateKey = new Ed25519PrivateKey(seed);
        let res = await app.rotateAuthKey({ fromAccount: from, toNewPrivateKey: privateKey });
        res = await app.waitForTransaction({ transactionHash: res.hash });
        return [res as UserTransactionResponse, privateKey];
    }

    static getAccountAfterRotate(input: AccountAddressInput, key: PrivateKey): Account {
        const address = AccountAddress.from(input);
        return Account.fromPrivateKeyAndAddress({ privateKey: key, address, legacy: true });
    }

    static printAccountInfo(account: Account) {
        const WIDTH = 16;

        const vals: any[] = [
            account.accountAddress.toString(),
            Account.authKey({ publicKey: account.publicKey }).toString(),
            account.privateKey.toString(),
            account.publicKey.toString(),
        ];

        console.log(
            `\n${"Address".padEnd(WIDTH)} ${"Auth Key".padEnd(WIDTH)} ${"Private Key".padEnd(
                WIDTH,
            )} ${"Public Key".padEnd(WIDTH)}`,
        )
        console.log(vals
            .map((v) => {
                return v.padEnd(WIDTH);
            })
            .join(" "))
    }
}
