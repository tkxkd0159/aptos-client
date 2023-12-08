import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join as pathJoin } from 'path';
import { cwd } from 'process';

import {
    AptosConfig, Network, Account, InputEntryFunctionData,
} from '@aptos-labs/ts-sdk'

import { Client, DataFactory } from './interaction';
import { getTestAccount, AptosAccount } from './account';
import { DefaultResource, TOKEN_PATH } from './resources';
import { printTxRes } from './utils';

async function main(): Promise<string> {
    const [c, tester] = testSetup();

    const res = await c.executor().fundAccount(tester.accountAddress, 100000000);
    console.log("Faucet: ", res.sender);
    let resource = await c.q().accountResource<DefaultResource>(tester.accountAddress, TOKEN_PATH["APT"]);
    console.log("resource: ", resource);

    return "\nFinished!"
}

main()
    .then((msg) => console.log(msg))
    .catch(console.error)


function testSetup(): [Client, Account] {
    const aptosConfig = new AptosConfig({ network: Network.LOCAL });
    const client = new Client(aptosConfig);
    const tester = getTestAccount();

    const scrtPath = pathJoin(cwd(), '.secrets');
    if (!existsSync(scrtPath)) {
        mkdirSync(scrtPath, { recursive: true });
    }
    if (!existsSync(pathJoin(scrtPath, "privKey"))) {
        writeFileSync(pathJoin(scrtPath, "privKey"), tester.privateKey.toString());
    }
    if (!existsSync(pathJoin(scrtPath, "acctInfo.json"))) {
        writeFileSync(pathJoin(scrtPath, "acctInfo.json"), JSON.stringify(AptosAccount.AccountInfoJSON(tester), undefined, 2));
    }

    return [client, tester];
}