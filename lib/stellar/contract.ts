import { ISmartContract, InvokeParam } from "./interfaces"

export class SorobanSmartContract implements ISmartContract {
    contractAddress: `${string}.${string}`
    chainId: any

    abi: any

    constructor(address: string, chainId: string) {
        this.contractAddress = address as `${string}.${string}`;
        this.chainId = chainId;

        this.abi = {} as any;
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

