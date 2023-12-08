import { TransactionResponse, TransactionResponseType, UserTransactionResponse } from "@aptos-labs/ts-sdk";

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

export function sleep(ms: number) {
    return new Promise((_) => {
        setTimeout(_, ms);
    });
}
