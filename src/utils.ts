import { TransactionResponse, TransactionResponseType, UserTransactionResponse } from "@aptos-labs/ts-sdk";

function isUserTx(tx: TransactionResponse): boolean {
    return tx.type === TransactionResponseType.User;
}

function isPending(tx: TransactionResponse): boolean {
    return tx.type === TransactionResponseType.Pending
}

function isGenesis(tx: TransactionResponse): boolean {
    return tx.type === TransactionResponseType.Genesis
}

function isBlockMetadata(tx: TransactionResponse): boolean {
    return tx.type === TransactionResponseType.BlockMetadata

}

function isStateCheckpoint(tx: TransactionResponse): boolean {
    return tx.type === TransactionResponseType.StateCheckpoint
}

function printTxRes(res: TransactionResponse) {
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

function sleep(ms: number) {
    return new Promise((_) => {
        setTimeout(_, ms);
    });
}

export {
    isPending, isUserTx, isStateCheckpoint, isBlockMetadata, isGenesis,
    printTxRes,
    sleep,
}