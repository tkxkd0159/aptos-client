import { MoveStructId } from '@aptos-labs/ts-sdk';

interface DefaultResource {
    coin: { value: number };
    deposit_events: { counter: number };
    withdraw_events: { counter: number };
    frozen: boolean;
}

const TOKEN_PATH: { [denom: string]: MoveStructId } = {
    "APT": "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
}

export { TOKEN_PATH, DefaultResource }