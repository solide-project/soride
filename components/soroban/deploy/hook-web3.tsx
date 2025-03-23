import { useState } from "react"

import { SorobanSmartContract } from "@/lib/stellar/contract"
import { DeployedContracts } from "@/lib/stellar/interfaces"
import { useProgram } from "../provider"
import { getContractId, initaliseTransactionBuilder } from "@/lib/stellar/utils";
import { Account, Transaction, xdr } from "@stellar/stellar-sdk";
import { signTransactionWithWallet, submitTx, TransactionResponse } from "@/lib/stellar/transaction";

export const useWeb3Hook = () => {
    const { networkServer } = useProgram()
    const [contracts, setContracts] = useState<DeployedContracts>({})

    const executeSend = async (
        contractAddress: string,
        method: string,
        args: xdr.ScVal[],
        value: number = 0
    ) => {
        // contractAddress = getAddress(contractAddress)
        if (!contracts.hasOwnProperty(contractAddress)) {
            throw new Error("Contract not loaded")
        }

        return contracts[contractAddress].send({
            method,
            args,
            value: value.toString(),
        })
    }

    const executeCall = async (
        contractAddress: string,
        method: string,
        args: xdr.ScVal[]
    ) => {
        if (!contracts.hasOwnProperty(contractAddress)) {
            throw new Error("Contract not loaded")
        }

        return contracts[contractAddress].call({ method, args })
    }

    const removeContract = (contractAddress: string) => {
        if (contracts.hasOwnProperty(contractAddress)) {
            delete contracts[contractAddress]
            setContracts({ ...contracts })
        }
    }

    const doDeployWasm = async ({
        userAddress,
        wasmData
    }: {
        userAddress?: string,
        wasmData: Blob
    }) => {
        if (!userAddress) {
            throw new Error("Requires login")
        }

        const contract = Buffer.from(await wasmData.arrayBuffer());
        const txBuilder = await initaliseTransactionBuilder(networkServer, userAddress)
        const tx: Transaction = await txBuilder
            .uploadContractWasmOp(contract)
            .buildAndPrepare(networkServer);
        console.log(tx)

        const network = await networkServer.getNetwork()
        const ret = await signTransactionWithWallet(tx.toXDR(), userAddress, "", network.passphrase);
        if (ret.status) {
            return Promise.reject("Transaction signing failed");
        }

        const reciept = await submitTx(ret.tx, networkServer);
        const wasmId = TransactionResponse.wasmId(reciept);

        return {
            wasmId,
            transactionHash: reciept.txHash
        }
    }

    const doDeploy = async ({
        contractId,
        userAddress,
        wasmId,
        args = [],
    }: {
        contractId: string,
        userAddress?: string,
        wasmId: string,
        args: xdr.ScVal[]
    }) => {
        if (contractId) {
            const contract = new SorobanSmartContract(contractId, networkServer)
            await contract.init()

            console.log(contract.abi)
            setContracts({
                ...contracts,
                [contractId]: contract,
            })
            return { contract: contractId, transactionHash: "" }
        }

        if (!userAddress) {
            throw new Error("Requires login")
        }

        const txBuilder = await initaliseTransactionBuilder(networkServer, userAddress)
        const source: Account = await networkServer.getAccount(userAddress);
        const tx: Transaction = await txBuilder
            .createContractOp(wasmId, source, args)
            .buildAndPrepareAsTransaction(networkServer);

        const network = await networkServer.getNetwork()
        const ret = await signTransactionWithWallet(tx.toXDR(), userAddress, "", network.passphrase);
        if (ret.status) {
            return Promise.reject("Transaction signing failed");
        }

        const reciept = await submitTx(ret.tx, networkServer);
        const contractHash = TransactionResponse.contractId(reciept);

        contractId = getContractId(contractHash)
        const contract = new SorobanSmartContract(contractId, networkServer)
        await contract.init()

        console.log(contract.abi)
        setContracts({
            ...contracts,
            [contractId]: contract,
        })

        return {
            contract: contractId,
            transactionHash: reciept.txHash
        };
    }

    return {
        executeCall,
        executeSend,
        doDeploy,
        doDeployWasm,

        contracts,
        removeContract,
    }
}
