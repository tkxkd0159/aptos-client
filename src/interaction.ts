import {
    Aptos, AptosConfig, Account,
    LedgerInfo, AccountData, MoveStructId, MoveFunctionId, TypeTag, HexInput,
    InputGenerateTransactionPayloadData, InputGenerateTransactionOptions, AnyRawTransaction, AccountAuthenticator, InputEntryFunctionData, EntryFunctionArgumentTypes, SimpleEntryFunctionArgumentTypes,
    AccountAddressInput,
    UserTransactionResponse,
    GetAccountOwnedTokensQueryResponse, MoveModuleBytecode, TransactionResponse, AnyNumber, MoveResource,
} from "@aptos-labs/ts-sdk"

import { WaitForTransactionOptions, OrderByArg, TokenStandardArg, PaginationArgs, LedgerVersionArg, DefaultQueryOpts, TokenOwnership } from "./option"

/**
 * @param data SingleSignerTransaction | MultiAgentTransaction
 * @param sender Sender's AccountAuthenticator
 * @param feePayer FeePayer's AccountAuthenticator (optional)
 */
interface SignedTx {
    data: AnyRawTransaction;
    sender: AccountAuthenticator;
    feePayer?: AccountAuthenticator;
}

interface CustomTxOptions {
    genTxOpts?: InputGenerateTransactionOptions;
    feePayer?: Account;
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

    async accountOwnedTokens(accountAddress: AccountAddressInput, ledgerVersion?: AnyNumber, options?: TokenStandardArg & PaginationArgs & OrderByArg<TokenOwnership>): Promise<GetAccountOwnedTokensQueryResponse> {
        return await this.app.account.getAccountOwnedTokens({ accountAddress, minimumLedgerVersion: ledgerVersion, options });
    }

    /**
     * @example
     * const savedMsg = await accountResource<DefaultResource>(tester.accountAddress, DataFactory.createResourcePath(tester.accountAddress, "message", 'MessageHolder'));
     */
    async accountResource<T extends {}>(accountAddress: AccountAddressInput, resourceType: MoveStructId, options?: LedgerVersionArg): Promise<T> {
        return await this.app.account.getAccountResource({ accountAddress, resourceType, options });
    }

    async accountResources(accountAddress: AccountAddressInput, options?: LedgerVersionArg): Promise<MoveResource[]> {
        return await this.app.account.getAccountResources({ accountAddress, options });
    }

    /**
     * @example
     * const modules = await accountModule(tester.accountAddress, "message");
     */
    async accountModule(accountAddress: AccountAddressInput, moduleName: string, options?: DefaultQueryOpts): Promise<MoveModuleBytecode> {
        return await this.app.account.getAccountModule({ accountAddress, moduleName, options });
    }

    async accountModules(accountAddress: AccountAddressInput, options?: DefaultQueryOpts): Promise<MoveModuleBytecode[]> {
        return await this.app.account.getAccountModules({ accountAddress, options });
    }

    async accountTxs(accountAddress: AccountAddressInput, options?: DefaultQueryOpts): Promise<TransactionResponse[]> {
        return await this.app.account.getAccountTransactions({ accountAddress, options });
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

    /**
     *
     * @param sender signer's account
     * @param data InputEntryFunctionData | InputScriptData | InputMultiSigData
     * @param options
     * @returns
     */
    async buildAndSignTx(signer: Account, data: InputGenerateTransactionPayloadData, options?: CustomTxOptions): Promise<SignedTx> {
        let withFeePayer = false;
        if (options?.feePayer) {
            withFeePayer = true;
        }

        const SingleSignerTransaction = await this.app.build.transaction({ sender: signer.accountAddress, data, options: options?.genTxOpts, withFeePayer });
        const senderAuthenticator = this.app.sign.transaction({ signer, transaction: SingleSignerTransaction });
        if (withFeePayer) {
            const feePayerAuthenticator = this.app.sign.transactionAsFeePayer({ signer, transaction: SingleSignerTransaction });
            return { data: SingleSignerTransaction, sender: senderAuthenticator, feePayer: feePayerAuthenticator };
        }
        return { data: SingleSignerTransaction, sender: senderAuthenticator };
    }

    async buildAndSignPkgTx(signer: Account, metadataBytes: HexInput, moduleBytecode: HexInput[], options?: InputGenerateTransactionOptions): Promise<SignedTx> {
        const SingleSignerTransaction = await this.app.publishPackageTransaction({ account: signer.accountAddress, metadataBytes, moduleBytecode, options });
        const senderAuthenticator = this.app.sign.transaction({ signer, transaction: SingleSignerTransaction });
        return { data: SingleSignerTransaction, sender: senderAuthenticator }
    }

    /**
     *
     * @example
     * const txData = DataFactory.createInputEntryFunctionData(
     *   DataFactory.createFuncPath(tester.accountAddress, <module_name>, <method_name>),
     *   ['string:hello, second message']);
     * const signedTx = await c.executor().buildAndSignTx(tester, txData);
     * const txRes = await c.executor().submitTx(signedTx);
     */
    async submitTx(tx: SignedTx): Promise<UserTransactionResponse> {
        const pendingTransaction = await this.app.submit.transaction({ transaction: tx.data, senderAuthenticator: tx.sender, feePayerAuthenticator: tx.feePayer });
        const res = await this.app.waitForTransaction({ transactionHash: pendingTransaction.hash });
        return res as UserTransactionResponse;
    }

    /**
     *
     * @param signer
     * @param transaction SingleSignerTransaction | MultiAgentTransaction
     */
    async signAndSubmitTx(signer: Account, transaction: AnyRawTransaction): Promise<UserTransactionResponse> {
        const pendingTransaction = await this.app.transactionSubmission.signAndSubmitTransaction({
            signer,
            transaction,
        });
        const res = await this.app.waitForTransaction({ transactionHash: pendingTransaction.hash });
        return res as UserTransactionResponse;
    }

    async sendAPT(from: Account, to: AccountAddressInput, amount: number, options?: CustomTxOptions): Promise<UserTransactionResponse> {
        const txData = DataFactory.createInputEntryFunctionData("0x1::coin::transfer", [to, amount], ["0x1::aptos_coin::AptosCoin"]);
        const signedTx = await this.buildAndSignTx(from, txData, options);
        return await this.submitTx(signedTx);
    }
}

export class Client {
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

export class DataFactory {
    constructor() { }

    static createInputEntryFunctionData(functionName: MoveFunctionId,
        args: Array<EntryFunctionArgumentTypes | SimpleEntryFunctionArgumentTypes>,
        typeArgs?: Array<TypeTag | string>): InputEntryFunctionData {
        return {
            function: functionName,
            functionArguments: args,
            typeArguments: typeArgs,
        }
    }

    static createFuncPath(address: AccountAddressInput, moduleName: string, methodName: string): MoveFunctionId {
        return `${address.toString()}::${moduleName}::${methodName}`;
    }

    static createResourcePath(address: AccountAddressInput, moduleName: string, resourceName: string): MoveStructId {
        return `${address.toString()}::${moduleName}::${resourceName}`;
    }
}
