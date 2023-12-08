export {
    WaitForTransactionOptions,
    TokenStandardArg, OrderByArg, PaginationArgs, LedgerVersionArg
} from "@aptos-labs/ts-sdk"

import { GetAccountOwnedTokensQueryResponse, PaginationArgs, LedgerVersionArg } from "@aptos-labs/ts-sdk"
export type TokenOwnership = GetAccountOwnedTokensQueryResponse[0]

/**
 *
 * Controls the number of results that are returned and the starting position of those results.
 * @param offset parameter specifies the starting position of the query result within the set of data. Default is 0.
 * @param limit specifies the maximum number of items or records to return in a query result. Default is 25.
 * @param ledgerVersion specifies ledger version of transactions. By default latest version will be used
 */
export type DefaultQueryOpts = PaginationArgs & LedgerVersionArg
