import {
    Aptos,
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
        return await this.app.getAccountModules({ accountAddress, options });
    }
    async getAccountOwnedTokens(accountAddress: AccountAddressInput, options?: TokenStandardArg & PaginationArgs & OrderByArg<TokenOwnership>): Promise<GetAccountOwnedTokensQueryResponse> {
        return await this.app.getAccountOwnedTokens({ accountAddress, options });
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