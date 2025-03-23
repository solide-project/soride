import { xdr } from "@stellar/stellar-sdk"

export type AbiItemType =
    | 'constructor'
    | 'error'
    | 'event'
    | 'fallback'
    | 'function'
    | 'receive'

export type AbiType = AbiConstructor
    | AbiFunction

    export type Abi = readonly (
    AbiConstructor
    | AbiFunction
)[]

export interface AbiFunction {
    doc: string
    name: string
    type: "function"
    inputs: AbiParameter[]
    outputs: AbiParameter[]
}

export interface AbiConstructor {
    doc: string
    name: string
    type: "constructor"
    inputs: AbiParameter[]
    outputs: AbiParameter[]
}

export interface AbiParameter {
    doc?: string,
    name?: string,
    type: xdr.ScSpecType
}