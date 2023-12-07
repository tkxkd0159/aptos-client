import {
    Aptos,
    UserTransactionResponse,
    MoveString,
    Serializer,
    Deserializer
} from '@aptos-labs/ts-sdk'

import e from './env'
import act, { isUserTx } from './interaction';
import { getAccount } from './account';
import { Encoder } from './codec';

const IS_DEBUG = true;

async function main() {

    const aptos = new Aptos();
    const q = new act.Query(aptos);
    const t = new act.Tx(aptos);
    const acc = getAccount();

    let res = await t.fundAccount(acc.accountAddress, 10000000);
    if (res.success && IS_DEBUG) {
        console.log("tx hash: ", res.hash);
        console.log("events: ");
        for (let evt of res.events) {
            console.log(`[${evt.type}]: ${JSON.stringify(evt.data)}`);
        }
        let tx = await aptos.getTransactionByHash({ transactionHash: res.hash });
        if (isUserTx(tx)) {
            let utx = tx as UserTransactionResponse;
            console.log(`Tx Success?: ${utx.success}\n${utx.sender}[${utx.sequence_number}] used ${utx.gas_unit_price}x${utx.gas_used}`)
        }
    }

    const module = await q.getAccountModules(e.account);
    console.log("modules: ", module);
    const tokens = await q.getAccountOwnedTokens(acc.accountAddress);
    console.log("tokens: ", tokens);
}

main().catch(console.error)

