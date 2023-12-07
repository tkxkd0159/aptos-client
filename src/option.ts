export {
    WaitForTransactionOptions,
    PaginationArgs, LedgerVersionArg, TokenStandardArg, OrderByArg,
} from "@aptos-labs/ts-sdk"

import { GetAccountOwnedTokensQueryResponse } from "@aptos-labs/ts-sdk"
type TokenOwnership = GetAccountOwnedTokensQueryResponse[0]

export { TokenOwnership }