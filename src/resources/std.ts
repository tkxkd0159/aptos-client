import {
    MoveStructId, MoveFunctionId,
    EntryFunctionArgumentTypes, SimpleEntryFunctionArgumentTypes, TypeTag, InputEntryFunctionData,
    AccountAddressInput
} from '@aptos-labs/ts-sdk';

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

export interface RCoinStore {
    coin: { value: number };
    deposit_events: { counter: number };
    withdraw_events: { counter: number };
    frozen: boolean;
}

export const TOKEN_PATH: { [denom: string]: MoveStructId } = {
    "APT": "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
}
