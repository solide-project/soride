export interface DeployedContracts {
    [key: string]: ISmartContract
}

export interface InvokeParam {
    method: string
    args: any[]
    value?: string
    gas?: string
    userAddress: string
}

export interface ISmartContract {
    /**
     * Specific soroban
     */
    wasmHash: string;
    wasmCode: string;

    contractAddress: string
    abi: any
    call(args: InvokeParam): Promise<any>
    send(args: InvokeParam): Promise<any>
}