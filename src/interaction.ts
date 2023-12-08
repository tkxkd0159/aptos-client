import {
    Aptos, AptosConfig,
    LedgerInfo, AccountData, MoveStructId,
    AccountAddressInput,
    UserTransactionResponse,
    GetAccountOwnedTokensQueryResponse, MoveModuleBytecode, TransactionResponse, AnyNumber,
} from "@aptos-labs/ts-sdk"

import { WaitForTransactionOptions, OrderByArg, TokenStandardArg, PaginationArgs, LedgerVersionArg, DefaultQueryOpts, TokenOwnership } from "./option"
import { isUserTx } from "./utils";

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

export { Client }