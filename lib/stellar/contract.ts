import { rpc } from "@stellar/stellar-sdk"
import { ISmartContract, InvokeParam } from "./interfaces"
import { SorosanContract } from "./soroban-contract"

export class SorobanSmartContract implements ISmartContract {
    contractAddress: string
    server: rpc.Server
    abi: any

    sorobanContract: SorosanContract
    wasmHash: string
    wasmCode: string

    constructor(address: string, server: rpc.Server) {
        this.contractAddress = address;
        this.server = server;

        this.sorobanContract = new SorosanContract(address);
        this.abi = []
        this.wasmHash = ""
        this.wasmCode = ""
    }

    async init() {
        const { code, wasmId, abi } = await this.sorobanContract.getContractInfo(this.server);
        this.wasmCode = code
        this.wasmHash = wasmId.toString('hex')
        this.abi = abi
    }

    async call({ method, args }: InvokeParam): Promise<any> {
    }

    /**
     * value in wei
     */
    async send({
        method,
        args,
        value = "0",
        // gas = "1000000",
        userAddress
    }: InvokeParam): Promise<any> {
    }
}