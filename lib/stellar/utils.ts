import { Address, Contract, nativeToScVal, StrKey, xdr } from "@stellar/stellar-sdk";
import BigNumber from 'bignumber.js';

/**
 * CBKGPQUWV55UPWCMQ4CZP3BU3RANV7TKKI2OOMRMII7YPGKOCXKHACFL -> 5467c296af7b47d84c870597ec34dc40dafe6a5234e7322c423f87994e15d470
 */
export const getContractHash = (contractId: string) =>
    new Contract(contractId).address().toScAddress().contractId().toString('hex');

/**
 * 5467c296af7b47d84c870597ec34dc40dafe6a5234e7322c423f87994e15d470 -> CBKGPQUWV55UPWCMQ4CZP3BU3RANV7TKKI2OOMRMII7YPGKOCXKHACFL
 */
export const getContractId = (contractHash: string) =>
    StrKey.encodeContract(hexToByte(contractHash));

export const isContractHash = (val: string) =>
    val.length === 64 && /^[a-zA-Z0-9]+$/.test(val);

export const isContractId = (val: string) =>
    val.length === 56 && /^[a-zA-Z0-9]+$/.test(val);

export const hexToByte = (hexString: string) => {
    if (hexString.length % 2 !== 0) {
        throw "Must have an even number of hex digits to convert to bytes";
    }
    var numBytes = hexString.length / 2;
    var byteArray = Buffer.alloc(numBytes);
    for (var i = 0; i < numBytes; i++) {
        byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return byteArray;
}

export const scSpecTypeToScVal = (type: string): string => {
    switch (type) {
        case xdr.ScSpecType.scSpecTypeAddress().name:
            return xdr.ScValType.scvAddress().name;
        case xdr.ScSpecType.scSpecTypeBool().name:
            return xdr.ScValType.scvBool().name;
        case xdr.ScSpecType.scSpecTypeBytes().name:
            return xdr.ScValType.scvBytes().name;
        case xdr.ScSpecType.scSpecTypeBytesN().name:
            return xdr.ScValType.scvBytes().name;
        case xdr.ScSpecType.scSpecTypeDuration().name:
            return xdr.ScValType.scvDuration().name;
        case xdr.ScSpecType.scSpecTypeI128().name:
            return xdr.ScValType.scvI128().name;
        case xdr.ScSpecType.scSpecTypeI256().name:
            return xdr.ScValType.scvI256().name;
        case xdr.ScSpecType.scSpecTypeI32().name:
            return xdr.ScValType.scvI32().name;
        case xdr.ScSpecType.scSpecTypeI64().name:
            return xdr.ScValType.scvI64().name;
        case xdr.ScSpecType.scSpecTypeMap().name:
            return xdr.ScValType.scvMap().name;
        case xdr.ScSpecType.scSpecTypeString().name:
            return xdr.ScValType.scvString().name;
        case xdr.ScSpecType.scSpecTypeSymbol().name:
            return xdr.ScValType.scvSymbol().name;
        case xdr.ScSpecType.scSpecTypeTimepoint().name:
            return xdr.ScValType.scvTimepoint().name;
        case xdr.ScSpecType.scSpecTypeU128().name:
            return xdr.ScValType.scvU128().name;
        case xdr.ScSpecType.scSpecTypeU256().name:
            return xdr.ScValType.scvU256().name;
        case xdr.ScSpecType.scSpecTypeU32().name:
            return xdr.ScValType.scvU32().name;
        case xdr.ScSpecType.scSpecTypeU64().name:
            return xdr.ScValType.scvU64().name;
        case xdr.ScSpecType.scSpecTypeVec().name:
            return xdr.ScValType.scvVec().name;
        // case xdr.ScSpecType.scSpecTypeVoid().name:
        //     return xdr.ScValType.scvVoid().name;
        default:
            return type;
        // return xdr.ScValType.scvString().name;
    }
}

export const toScVal = (arg: any, type?: string): xdr.ScVal => {
    type = scSpecTypeToScVal(type || xdr.ScValType.scvString().name)
    type = (type && type.toLowerCase()) || "";
    switch (typeof arg) {
        case "string":
            switch (type) {
                case "address":
                case "scvAddress".toLowerCase():
                case "scvContractInstance".toLowerCase():
                    return new Address(arg).toScVal();
                case "bytes":
                case "scvBytes".toLowerCase():
                case "scvBytesN".toLowerCase():
                    return xdr.ScVal.scvBytes(Buffer.from(arg, "hex"));
                case "symbol":
                    return xdr.ScVal.scvSymbol(arg);
                case "scvBool".toLowerCase():
                    return xdr.ScVal.scvBool(arg != null);
                case "i32".toLowerCase():
                case "scvI32".toLowerCase():
                    return xdr.ScVal.scvI32(Number(arg));
                case "i64".toLowerCase():
                case "scvI64".toLowerCase():
                    return nativeToScVal(arg, { type: "i64" });
                case "i128".toLowerCase():
                case "scvI128".toLowerCase():
                    return nativeToScVal(arg, { type: "i128" });
                case "i256".toLowerCase():
                case "scvI256".toLowerCase():
                    return nativeToScVal(arg, { type: "i256" });
                case "u64".toLowerCase():
                case "scvU64".toLowerCase():
                    return nativeToScVal(arg, { type: "u64" });
                case "u32".toLowerCase():
                case "scvU32".toLowerCase():
                    return xdr.ScVal.scvU32(Number(arg));
                case "u128".toLowerCase():
                case "scvU128".toLowerCase():
                    return nativeToScVal(arg, { type: "u128" });
                case "u256".toLowerCase():
                case "scvU256".toLowerCase():
                    return nativeToScVal(arg, { type: "u256" });
                case "timepoint".toLowerCase():
                case "scvTimepoint".toLowerCase():
                    var val: xdr.TimePoint = new xdr.Uint64(arg);
                    return xdr.ScVal.scvTimepoint(val);
                case "duration".toLowerCase():
                case "scvDuration".toLowerCase():
                    var val: xdr.Duration = new xdr.Uint64(arg);
                    return xdr.ScVal.scvDuration(val);
                default:
                    return xdr.ScVal.scvString(arg);
            }
        case "number":
            switch (type) {
                case "i32".toLowerCase():
                case "scvI32".toLowerCase():
                    return xdr.ScVal.scvI32(arg);
                case "i64".toLowerCase():
                case "scvI64".toLowerCase():
                    return nativeToScVal(arg, { type: "i64" });
                case "i128".toLowerCase():
                case "scvI128".toLowerCase():
                    return nativeToScVal(arg, { type: "i128" });
                case "i256".toLowerCase():
                case "scvI256".toLowerCase():
                    return nativeToScVal(arg, { type: "i256" });
                case "u32".toLowerCase():
                case "scvU32".toLowerCase():
                    return xdr.ScVal.scvU32(Number(arg));
                case "u64".toLowerCase():
                case "scvU64".toLowerCase():
                    return nativeToScVal(arg, { type: "u64" });
                case "u128".toLowerCase():
                case "scvU128".toLowerCase():
                    return nativeToScVal(arg, { type: "u128" });
                case "u256".toLowerCase():
                case "scvU256".toLowerCase():
                    return nativeToScVal(arg, { type: "u256" });
                case "timepoint".toLowerCase():
                case "scvTimepoint".toLowerCase():
                    var val: xdr.TimePoint = new xdr.Uint64(arg);
                    return xdr.ScVal.scvTimepoint(val);
                case "duration".toLowerCase():
                case "scvDuration".toLowerCase():
                    var val: xdr.Duration = new xdr.Uint64(arg);
                    return xdr.ScVal.scvDuration(val);
                default:
                    return xdr.ScVal.scvI32(arg);
            }
        case "boolean":
            return xdr.ScVal.scvBool(arg);
        case "object":
            return xdr.ScVal.scvBytes(arg);
        default:
            throw new Error("Unsupported type");
    }
}

export const stroopToXlm = (stroops: BigNumber): BigNumber => {
    if (stroops instanceof Number) {
        return stroops.dividedBy(1e7);
    }
    return new BigNumber(Number(stroops) / 1e7);
};

export const xlmToStroop = (lumens: BigNumber | string): BigNumber => {
    let lumensValue: BigNumber;

    if (lumens instanceof BigNumber) {
        lumensValue = lumens;
    } else {
        const parsedValue = new BigNumber(lumens);

        if (parsedValue.isNaN()) {
            throw new Error('Invalid input: not a valid number');
        }

        if (parsedValue.isNegative()) {
            throw new Error('Invalid input: negative values are not allowed');
        }

        lumensValue = parsedValue;
    }

    return lumensValue.times(1e7);
};