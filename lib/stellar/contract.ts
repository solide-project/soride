import { rpc, Transaction, xdr } from "@stellar/stellar-sdk"
import { ISmartContract, InvokeParam } from "./interfaces"
import { SorosanContract } from "./soroban-contract"
import { signTransactionWithWallet, simulateTx, submitTx } from "./transaction"
import { initaliseTransactionBuilder } from "./utils"
import { getEstimatedFee, PLACEHOLDER_ACCOUNT } from "./server"

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

    async call({ method, args, userAddress }: InvokeParam): Promise<any> {
        const txBuilder = await initaliseTransactionBuilder(this.server,
            userAddress || PLACEHOLDER_ACCOUNT);
        const tx = await txBuilder
            .invokeContractFunctionOp(this.contractAddress, method, args)
            .buildAndPrepare(this.server);

        const result = await simulateTx<any>(tx, this.server);
        return result;
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
    }: InvokeParam): Promise<rpc.Api.GetTransactionResponse> {
        if (!args) args = [];
        const gas = await this.calculateEstimateGas(this.contractAddress, method, args, userAddress);

        console.log("GAS", gas)
        const txBuilder = await initaliseTransactionBuilder(this.server, userAddress, gas.toString());
        const tx: Transaction = await txBuilder
            .invokeContractFunctionOp(this.contractAddress, method, args)
            .buildAndPrepareAsTransaction(this.server);
        console.log("TX", tx)

        const network = await this.server.getNetwork()
        const signedTx = await signTransactionWithWallet(
            tx.toXDR(),
            this.contractAddress,
            "",
            network.passphrase,
        )

        // If there is an error, the user likely canceled the transaction.
        if (signedTx.status) {
            throw new Error(signedTx.status);
        }

        try {
            // Submit transaction
            return await submitTx(signedTx.tx, this.server);
        } catch (e: any) {
            throw new Error(`Transaction Submission Error: ${e.message}`);
        }
    }

    protected async calculateEstimateGas(
        contractAddress: string,
        method: string,
        args: xdr.ScVal[],
        userAddress: string,
    ): Promise<string> {
        // Create a transaction builder with a placeholder account (no actual account used).
        const txBuilder = await initaliseTransactionBuilder(this.server, userAddress);

        // Get the estimated gas cost by simulating the transaction.
        return await getEstimatedFee(
            contractAddress,
            txBuilder,
            this.server,
            "",
            method,
            args
        );
    }

}