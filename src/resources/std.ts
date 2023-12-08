import { MoveStructId } from '@aptos-labs/ts-sdk';

export interface RCoinStore {
    coin: { value: number };
    deposit_events: { counter: number };
    withdraw_events: { counter: number };
    frozen: boolean;
}

export const TOKEN_PATH: { [denom: string]: MoveStructId } = {
    "APT": "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
}
