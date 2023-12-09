import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { TransactionResponse, TransactionResponseType, UserTransactionResponse, AccountAddress, HexInput, Hex } from "@aptos-labs/ts-sdk";

export function isUserTx(tx: TransactionResponse): boolean {
    return tx.type === TransactionResponseType.User;
}

export function isPending(tx: TransactionResponse): boolean {
    return tx.type === TransactionResponseType.Pending
}

export function isGenesis(tx: TransactionResponse): boolean {
    return tx.type === TransactionResponseType.Genesis
}

export function isBlockMetadata(tx: TransactionResponse): boolean {
    return tx.type === TransactionResponseType.BlockMetadata

}

export function isStateCheckpoint(tx: TransactionResponse): boolean {
    return tx.type === TransactionResponseType.StateCheckpoint
}

export function printTxRes(res: TransactionResponse) {
    console.log("tx hash: ", res.hash, "tx type: ", res.type);

    if (isUserTx(res)) {
        const ures = res as UserTransactionResponse;
        console.log(`Tx completed?: ${ures.success}\n${ures.sender}[${ures.sequence_number}] paid '${ures.gas_used} gas x ${ures.gas_unit_price}' for this tx`)
        console.log("events: ");
        for (let evt of ures.events) {
            console.log(`\t[${evt.type}]: ${JSON.stringify(evt.data)}`);
        }
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise((_) => {
        setTimeout(_, ms);
    });
}

/**
 * A convenience function to compile a package locally with the CLI
 * @param packageDir Path to a move package (the folder with a Move.toml file)
 * @param outputFile JSON output file to write publication transaction to
 * @param namedAddresses
 */
export function compilePackage(
    packageDir: string,
    outputFile: string,
    namedAddresses: Array<{ name: string; address: AccountAddress }>,
) {
    console.log("In order to run compilation, you must have the `aptos` CLI installed.");
    try {
        execSync("aptos --version");
    } catch (e) {
        console.log("aptos is not installed. Please install it from the instructions on aptos.dev");
    }

    const addressArg = namedAddresses.map(({ name, address }) => `${name}=${address}`).join(" ");

    const compileCommand = `aptos move build-publish-payload --json-output-file ${outputFile} --package-dir ${packageDir} --named-addresses ${addressArg} --assume-yes`;
    execSync(compileCommand);
}

/**
 * A convenience function to get the compiled package metadataBytes and byteCode
 * @param filePath Path to JSON output file which is publication transaction (root path is execution path)
 */
export function getPackageBytesToPublish(filePath: string): { metadataBytes: HexInput; byteCode: HexInput[] } {
    const cwd = process.cwd();
    const modulePath = path.join(cwd, filePath);
    const jsonData = JSON.parse(fs.readFileSync(modulePath, "utf8"));
    const metadataBytes = jsonData.args[0].value;
    const byteCode = jsonData.args[1].value;

    return { metadataBytes, byteCode };
}

/**
 * @description
 * Only use for local testing
 */
export async function compileCodeAndGetPackageBytesToPublish(
    packageDir: string,
    outputFile: string,
    namedAddresses: Array<{ name: string; address: AccountAddress }>,
): Promise<{ metadataBytes: HexInput; byteCode: HexInput[] }> {
    compilePackage(packageDir, outputFile, namedAddresses);
    await sleep(1000);
    return getPackageBytesToPublish(outputFile);
}
