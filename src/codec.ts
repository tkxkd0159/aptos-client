import {
    Serializer, Serializable,
    U8, U16, U32, U64, U128, U256, Bool, AccountAddress,
    MoveVector, MoveOption, MoveString,
    EntryFunctionArgument
} from "@aptos-labs/ts-sdk"

type MoveType<T extends Serializable & EntryFunctionArgument> = MoveScriptType<T> | MoveOption<T>;
type MoveScriptType<T extends Serializable & EntryFunctionArgument> = U8 | U16 | U32 | U64 | U128 | U256 | Bool | AccountAddress | MoveVector<T> | MoveString
class MoveTypeEncoder {

    constructor() { }

    /**
    * How to deserialize:
    * ```ts
    * const serializedData = Encoder.serialize(new U8(1));
    * const originData = U8.deserialize(new Deserializer(data));
    * ```
    **/
    static serialize<T extends Serializable & EntryFunctionArgument>(v: MoveType<T>): Uint8Array {
        const s = new Serializer();
        v.serialize(s);
        return s.toUint8Array();
    }

    // prefix(0x0B) with serialized data
    static serializeForEntryFunction<T extends Serializable & EntryFunctionArgument>(v: MoveType<T>): Uint8Array {
        const s = new Serializer();
        v.serializeForEntryFunction(s);
        return s.toUint8Array();
    }

    // prefix(0x04) with serialized data
    static serializeForScriptFunction<T extends Serializable & EntryFunctionArgument>(v: MoveScriptType<T>): Uint8Array {
        const s = new Serializer();
        v.serializeForScriptFunction(s);
        return s.toUint8Array();
    }
}

export { MoveTypeEncoder }