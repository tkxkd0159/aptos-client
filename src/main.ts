import {
    Aptos, AptosConfig, Network,
    UserTransactionResponse,
} from '@aptos-labs/ts-sdk'

import act, { isUserTx } from './interaction';
import { getTestAccount } from './account';
import { APT, TOKEN_PATH } from './resources';

const IS_DEBUG = true;

async function main(): Promise<string> {

    const aptosConfig = new AptosConfig({ network: Network.LOCAL });

    const aptos = new Aptos(aptosConfig);
    const q = new act.Query(aptos);
    const t = new act.Tx(aptos);
    const acc = getTestAccount();

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
            console.log(`Tx Success?: ${utx.success}\n${utx.sender}[${utx.sequence_number}] paid ${utx.gas_unit_price}x${utx.gas_used} for this tx`)
        }
    }

    const module = await q.getAccountModules(acc.accountAddress);
    console.log("modules: ", module);
    const accInfo = await aptos.getAccountInfo({ accountAddress: acc.accountAddress });
    console.log("account info: ", acc.accountAddress.toString(), JSON.stringify(accInfo));
    const accTxs = await aptos.getAccountTransactions({ accountAddress: acc.accountAddress });
    console.log("account txs: ", accTxs);
    const tokens = await q.getAccountOwnedTokens(acc.accountAddress);
    console.log("tokens: ", tokens);

    const resource = await aptos.getAccountResource({
        accountAddress: acc.accountAddress,
        resourceType: TOKEN_PATH["APT"],
    });
    const balance = APT.parseAccountResource(resource);
    console.log("resource: ", balance);


    const ledgerInfo = await q.getLedgerInfo();
    console.log("ledger version: ", ledgerInfo);

    return "\nFinished!"
}

main()
    .then((msg) => console.log(msg))
    .catch(console.error)

