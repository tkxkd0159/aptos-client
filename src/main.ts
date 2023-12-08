import {
    AptosConfig, Network, Secp256k1PrivateKey,
} from '@aptos-labs/ts-sdk'

import { Client } from './interaction';
import { getTestAccount, AptosAccount, } from './account';
import { DefaultResource, TOKEN_PATH } from './resources';
import { printTxRes } from './utils';


async function main(): Promise<string> {

    const aptosConfig = new AptosConfig({ network: Network.LOCAL });
    const c = new Client(aptosConfig);
    const acc = getTestAccount();
    await c.executor().fundAccount(acc.accountAddress, 100000000);
    const resource = await c.q().accountResource<DefaultResource>(acc.accountAddress, TOKEN_PATH["APT"]);
    console.log("resource: ", resource);



    return "\nFinished!"
}

main()
    .then((msg) => console.log(msg))
    .catch(console.error)
