import { readFileSync, existsSync, rmSync } from 'fs';
import { join as pathJoin } from 'path';
import { cwd } from 'process';
import { execSync } from "child_process";
import { randomBytes } from 'crypto';
import { Buffer } from 'buffer';

import {
    Aptos, AptosConfig, Network,
    HexInput, Account, AccountAddress,
    Ed25519PrivateKey,
    AnyRawTransaction, UserTransactionResponse, CommittedTransactionResponse, Hex,
} from '@aptos-labs/ts-sdk'

const SEED = "b23bc4fba89a643cdd3ceb43b1b996c7f5a797b0abd84c3ab900a25319c09c06"
const APT = "0x1::aptos_coin::AptosCoin"
const APT_STORE_PATH = `0x1::coin::CoinStore<${APT}>`

async function main(): Promise<string> {
    const dummyAddress = AccountAddress.fromString("0x" + randomBytes(32).toString("hex"));

    const privateKey = new Ed25519PrivateKey(SEED);
    const tester = Account.fromPrivateKey({ privateKey, legacy: true });
    const app = new Aptos(new AptosConfig({ network: Network.LOCAL }))

    const res = await app.fundAccount({
        accountAddress: tester.accountAddress,
        amount: 100000000,
    });
    if (!res.success) {
        throw new Error("failed to fund account");
    }
    const faucet = AccountAddress.fromString(res.sender);
    let faucetCoinStoreState = await app.getAccountResource<RCoinStore>({
        accountAddress: faucet,
        resourceType: APT_STORE_PATH,
    });
    const beforeAmount = faucetCoinStoreState.coin.value;

    // --------------------------------------------
    // compile and publish package

    const { metadataBytes, moduleBytecode } = await compilePkg("contracts/interview", "Interview.json", [{ name: "ljs", address: tester.accountAddress }]);
    const transaction = await app.publishPackageTransaction({
        account: tester.accountAddress,
        metadataBytes,
        moduleBytecode,
    })

    const transactionResult = await signAndSubmitTransaction(app, tester, transaction);

    if (!transactionResult.success) {
        throw new Error("failed to publish package");
    }

    // --------------------------------------------
    const moduleName = "transfer";
    const methodName = "transfer_coin"
    const sentAmount = 746;
    const eventName = `${tester.accountAddress.toString()}::${moduleName}::CoinTransfer`
    const eventProperties = ['from', 'to', 'amount', 'timestamp'];

    // 1. successful case
    const txSend = await app.build.transaction(
        {
            sender: tester.accountAddress,
            data: {
                function: `${tester.accountAddress.toString()}::${moduleName}::${methodName}`,
                functionArguments: [faucet, sentAmount],
                typeArguments: [APT],
            }
        }
    )
    const txSendResult = await signAndSubmitTransaction(app, tester, txSend);

    if (!txSendResult.success) {
        throw new Error("failed to send Coin");
    }
    if (!checkEvent(txSendResult as UserTransactionResponse, eventName, eventProperties)) {
        throw new Error("requirements are not properly implemented");
    }

    faucetCoinStoreState = await app.getAccountResource<RCoinStore>({
        accountAddress: faucet,
        resourceType: APT_STORE_PATH,
    });
    const afterAmount = faucetCoinStoreState.coin.value;
    if ((afterAmount - beforeAmount) !== sentAmount) {
        throw new Error("transfer failed");
    }

    // 2. unsuccessful case (not registered)
    let checkCase2 = false;
    try {
        const txSend = await app.build.transaction(
            {
                sender: tester.accountAddress,
                data: {
                    function: `${tester.accountAddress.toString()}::${moduleName}::${methodName}`,
                    functionArguments: [dummyAddress, sentAmount],
                    typeArguments: [APT],
                }
            }
        )
        await signAndSubmitTransaction(app, tester, txSend);
    }
    catch (e) {
        if (e instanceof Error) { console.log(e.message); checkCase2 = true; }
    }

    if (!checkCase2) {
        throw new Error("requirements are not properly implemented");
    }

    await runScript(app, tester, "contracts/interview", "JaeseungInterview", "main.mv");

    return "\nDone!"
}

main()
    .then(console.log)
    .catch(console.error)

interface RCoinStore {
    coin: { value: number };
    deposit_events: { counter: number };
    withdraw_events: { counter: number };
    frozen: boolean;
}

async function compilePkg(
    packageDir: string,
    outputFileName: string,
    namedAddresses: Array<{ name: string; address: AccountAddress }>,
): Promise<{ metadataBytes: HexInput; moduleBytecode: HexInput[] }> {
    const buildPath = pathJoin(packageDir, "build")
    const outputFilePath = pathJoin(buildPath, outputFileName);
    if (existsSync(buildPath)) {
        rmSync(buildPath, { recursive: true, force: true });
    }

    try {
        execSync("aptos --version");
    } catch (e) {
        console.log("aptos is not installed. Please install it from the instructions on aptos.dev");
    }

    const addressArg = namedAddresses.map(({ name, address }) => `${name}=${address}`).join(" ");
    const compileCommand = `aptos move build-publish-payload --json-output-file ${outputFilePath} --package-dir ${packageDir} --named-addresses ${addressArg} --assume-yes`;
    execSync(compileCommand);
    await new Promise((_) => {
        setTimeout(_, 1000);
    })

    const jsonData = JSON.parse(readFileSync(pathJoin(cwd(), outputFilePath), "utf8"));
    const metadataBytes = jsonData.args[0].value;
    const moduleBytecode = jsonData.args[1].value;
    return { metadataBytes, moduleBytecode };
}

async function signAndSubmitTransaction(app: Aptos, signer: Account, transaction: AnyRawTransaction): Promise<CommittedTransactionResponse> {
    const senderAuthenticator = app.sign.transaction({ signer, transaction });
    const pendingTransaction = await app.submit.transaction({ transaction, senderAuthenticator });
    return await app.waitForTransaction({ transactionHash: pendingTransaction.hash });
}

function checkEvent(res: UserTransactionResponse, eventName: string, eventProperties: string[]): boolean {
    for (let evt of res.events) {
        if (evt.type === eventName) {
            for (let prop of eventProperties) {
                if (!(evt.data as object).hasOwnProperty(prop)) {
                    return false;
                }
            }
            return true;
        }
    }

    return false;
}

async function runScript(app: Aptos, signer: Account, packageDir: string, packageName: string, scriptName: string): Promise<CommittedTransactionResponse> {
    const scriptPath: string = pathJoin(cwd(), packageDir, "build", packageName, "bytecode_scripts", scriptName);
    const binaryScriptData: Buffer = readFileSync(scriptPath);
    const txScript = await app.build.transaction(
        {
            sender: signer.accountAddress,
            data: {
                bytecode: binaryScriptData,
                functionArguments: [],
            }
        }
    )

    const res = await signAndSubmitTransaction(app, signer, txScript);
    if (res.success) {
        console.log("\n > Script executed successfully!!!\nEvents:\n")
        for (let evt of (res as UserTransactionResponse).events) {
            console.log(`${JSON.stringify(evt, undefined, 4)}`)
        }
    }

    return res
}
