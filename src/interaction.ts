import {
    Aptos, AptosConfig, Account,
    LedgerInfo, AccountData, MoveStructId, MoveFunctionId, TypeTag,
    InputGenerateTransactionPayloadData, InputGenerateTransactionOptions, AnyRawTransaction, AccountAuthenticator, InputEntryFunctionData, EntryFunctionArgumentTypes, SimpleEntryFunctionArgumentTypes,
    AccountAddressInput,
    UserTransactionResponse,
    GetAccountOwnedTokensQueryResponse, MoveModuleBytecode, TransactionResponse, AnyNumber, AccountAddress,
} from "@aptos-labs/ts-sdk"

import { WaitForTransactionOptions, OrderByArg, TokenStandardArg, PaginationArgs, LedgerVersionArg, DefaultQueryOpts, TokenOwnership } from "./option"

/**
 * @param data: SingleSignerTransaction | MultiAgentTransaction
 * @param sender: Sender's AccountAuthenticator
 * @param feePayer: FeePayer's AccountAuthenticator (optional)
 */
interface SignedTx {
    data: AnyRawTransaction;
    sender: AccountAuthenticator;
    feePayer?: AccountAuthenticator;
}

class Query {
    private app: Aptos;

    constructor(app: Aptos) {
        this.app = app;
    }

    // General

    /**
     * @returns LedgerInfo
     * - epoch: The current epoch number associated with the chain network
     * - ledger_version: The ledger version that represents the blockchain state at a specific time
     * - ledger_timestamp: The timestamp associated with the ledger, indicating the time when the ledger was last updated
     * - block_height: The height of the block
    **/
    async ledgerInfo(): Promise<LedgerInfo> {
        return await this.app.general.getLedgerInfo();

    }

    // Account
    async accountInfo(accountAddress: AccountAddressInput): Promise<AccountData> {
        return await this.app.account.getAccountInfo({ accountAddress });
    }

    async accountResource<T extends {}>(accountAddress: AccountAddressInput, resourceType: MoveStructId, options?: LedgerVersionArg): Promise<T> {
        return await this.app.account.getAccountResource({ accountAddress, resourceType, options });
    }

    async accountOwnedTokens(accountAddress: AccountAddressInput, ledgerVersion?: AnyNumber, options?: TokenStandardArg & PaginationArgs & OrderByArg<TokenOwnership>): Promise<GetAccountOwnedTokensQueryResponse> {
        return await this.app.account.getAccountOwnedTokens({ accountAddress, minimumLedgerVersion: ledgerVersion, options });
    }

    async accountTxs(accountAddress: AccountAddressInput, options?: DefaultQueryOpts): Promise<TransactionResponse[]> {
        return await this.app.account.getAccountTransactions({ accountAddress, options });
    }
    async accountModules(accountAddress: AccountAddressInput, options?: DefaultQueryOpts): Promise<MoveModuleBytecode[]> {
        return await this.app.account.getAccountModules({ accountAddress, options });
    }
}

class Tx {
    private app: Aptos;

    constructor(app: Aptos) {
        this.app = app;
    }

    async fundAccount(accountAddress: AccountAddressInput, amount: number, options?: WaitForTransactionOptions): Promise<UserTransactionResponse> {
        return await this.app.fundAccount({ accountAddress, amount, options });
    }

    async buildAndSignTx(sender: Account, data: InputGenerateTransactionPayloadData, options?: { genTxOpts?: InputGenerateTransactionOptions, feePayer?: Account }): Promise<SignedTx> {
        let withFeePayer = false;
        if (options?.feePayer) {
            withFeePayer = true;
        }

        const SingleSignerTransaction = await this.app.build.transaction({ sender: sender.accountAddress, data, options: options?.genTxOpts, withFeePayer });
        const senderAuthenticator = this.app.sign.transaction({ signer: sender, transaction: SingleSignerTransaction });
        if (withFeePayer) {
            const feePayerAuthenticator = this.app.sign.transactionAsFeePayer({ signer: sender, transaction: SingleSignerTransaction });
            return { data: SingleSignerTransaction, sender: senderAuthenticator, feePayer: feePayerAuthenticator };
        }
        return { data: SingleSignerTransaction, sender: senderAuthenticator };
    }

    async submitTx(tx: SignedTx): Promise<UserTransactionResponse> {
        const pendingRes = await this.app.submit.transaction({ transaction: tx.data, senderAuthenticator: tx.sender, feePayerAuthenticator: tx.feePayer });
        const res = await this.app.waitForTransaction({ transactionHash: pendingRes.hash });
        return res as UserTransactionResponse;
    }

    async sendAPT(from: Account, to: AccountAddressInput, amount: number, options?: { genTxOpts?: InputGenerateTransactionOptions, feePayer?: Account }): Promise<UserTransactionResponse> {
        const txData = DataFactory.createInputEntryFunctionData("0x1::coin::transfer", [to, amount], ["0x1::aptos_coin::AptosCoin"]);
        const signedTx = await this.buildAndSignTx(from, txData, options);
        return await this.submitTx(signedTx);
    }
}

class Client {
    private core: Aptos;
    private query: Query;
    private tx: Tx;

    constructor(config: AptosConfig) {
        this.core = new Aptos(config);
        this.query = new Query(this.core);
        this.tx = new Tx(this.core);
    }

    q(): Query {
        return this.query;
    }

    executor(): Tx {
        return this.tx;
    }

    app(): Aptos {
        return this.core;
    }
}

class DataFactory {
    constructor() { }

    static createInputEntryFunctionData(functionName: MoveFunctionId,
        args: Array<EntryFunctionArgumentTypes | SimpleEntryFunctionArgumentTypes>,
        typeArgs?: Array<TypeTag | string>): InputEntryFunctionData {
        return {
            function: functionName,
            typeArguments: typeArgs,
            functionArguments: args,
        }
    }

}

export { Client, DataFactory }