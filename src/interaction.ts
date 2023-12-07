import {
    Aptos,
    LedgerInfo,
    AccountAddressInput,
    UserTransactionResponse,
    GetAccountOwnedTokensQueryResponse, MoveModuleBytecode, TransactionResponse,
} from "@aptos-labs/ts-sdk"

import { WaitForTransactionOptions, OrderByArg, TokenStandardArg, PaginationArgs, TokenOwnership } from "./option"

class Query {
    private app: Aptos;

    constructor(app: Aptos) {
        this.app = app;
    }

    async getAccountModules(accountAddress: AccountAddressInput, options?: PaginationArgs): Promise<MoveModuleBytecode[]> {
        return await this.app.account.getAccountModules({ accountAddress, options });
    }
    async getAccountOwnedTokens(accountAddress: AccountAddressInput, options?: TokenStandardArg & PaginationArgs & OrderByArg<TokenOwnership>): Promise<GetAccountOwnedTokensQueryResponse> {
        return await this.app.account.getAccountOwnedTokens({ accountAddress, options });
    }

    /**
     * @returns LedgerInfo
     * - epoch: The current epoch number associated with the chain network
     * - ledger_version: The ledger version that represents the blockchain state at a specific time
     * - ledger_timestamp: The timestamp associated with the ledger, indicating the time when the ledger was last updated
     * - block_height: The height of the block
    **/
    async getLedgerInfo(): Promise<LedgerInfo> {
        return await this.app.getLedgerInfo();

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

function isUserTx(tx: TransactionResponse): boolean {
    return tx.type === "user_transaction";
}

export default { Query, Tx }
export { isUserTx }