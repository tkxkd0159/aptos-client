import { writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join as pathJoin } from 'path';
import { cwd } from 'process';

import {
    AptosConfig, Network, Account, UserTransactionResponse, AccountAddress,
} from '@aptos-labs/ts-sdk'

import { Client } from './interaction';
import { getTestAccount, AptosAccount } from './account';
import { DataFactory, TOKEN_PATH, RCoinStore, RMessageHolder } from './resources';
import { printTxRes, compileCodeAndGetPackageBytesToPublish } from './utils';

async function main(): Promise<string> {
    const [c, tester] = testSetup();

    const res = await c.executor().fundAccount(tester.accountAddress, 100000000);
    console.log("Faucet: ", res.sender);
    let resource = await c.q().accountResource<RCoinStore>(tester.accountAddress, TOKEN_PATH["APT"]);
    console.log("Tester's CoinStoreSate: ", resource);

    const txRes = await compileAndPublishPkg(c, tester, "contracts/hello_world", "HelloWorld.json", [{ name: "tester", address: tester.accountAddress }]);
    printTxRes(txRes);

    const moduleName = "message";
    const methodName = "set_message";
    const txData = DataFactory.createInputEntryFunctionData(
        DataFactory.createFuncPath(tester.accountAddress, moduleName, methodName),
        ["Hello first message!"]);
    const signedTx2 = await c.executor().buildAndSignTx(tester, txData);
    const txRes2 = await c.executor().submitTx(signedTx2);
    printTxRes(txRes2);


    // * call Move module
    const modules = await c.q().accountModules(tester.accountAddress);
    console.log("modules: ", modules);
    const resourceName = "MessageHolder";
    const savedMsg = await c.q().accountResource<RMessageHolder>(tester.accountAddress, DataFactory.createResourcePath(tester.accountAddress, moduleName, resourceName));
    console.log("savedMsg: ", savedMsg.message);

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
    if (!existsSync(pathJoin(scrtPath, "private-key"))) {
        writeFileSync(pathJoin(scrtPath, "private-key"), tester.privateKey.toString());
    }
    if (!existsSync(pathJoin(scrtPath, "account-info.json"))) {
        writeFileSync(pathJoin(scrtPath, "account-info.json"), JSON.stringify(AptosAccount.AccountInfoJSON(tester), undefined, 2));
    }

    return [client, tester];
}

async function compileAndPublishPkg(client: Client, signer: Account, modulePath: string, outfileName: string, namedAddress: Array<{ name: string; address: AccountAddress }>): Promise<UserTransactionResponse> {
    // * compile Move module
    const buildPath = pathJoin(modulePath, "build")
    if (existsSync(buildPath)) {
        rmSync(buildPath, { recursive: true, force: true });
    }

    const { metadataBytes, byteCode } = await compileCodeAndGetPackageBytesToPublish(modulePath, pathJoin(buildPath, outfileName), namedAddress);

    // * publish Move module
    const signedTx = await client.executor().buildAndSignPkgTx(signer, metadataBytes, byteCode);
    return await client.executor().submitTx(signedTx);
}