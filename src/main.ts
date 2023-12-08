import {
    AptosConfig, Network, InputEntryFunctionData,
} from '@aptos-labs/ts-sdk'

import { Client, DataFactory } from './interaction';
import { getTestAccount, } from './account';
import { DefaultResource, TOKEN_PATH } from './resources';
import { printTxRes } from './utils';

const FAUCET = "0xdcb76a33cf76c8c54cecc6559d0cf5e8612de099199320e0059a5ff76b3273ba"

async function main(): Promise<string> {

    const aptosConfig = new AptosConfig({ network: Network.LOCAL });
    const c = new Client(aptosConfig);
    const tester = getTestAccount();
    await c.executor().fundAccount(tester.accountAddress, 100000000);
    let resource = await c.q().accountResource<DefaultResource>(tester.accountAddress, TOKEN_PATH["APT"]);
    console.log("resource: ", resource);

    return "\nFinished!"
}

main()
    .then((msg) => console.log(msg))
    .catch(console.error)
