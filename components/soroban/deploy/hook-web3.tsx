import { useState } from "react"

import { SorobanSmartContract } from "@/lib/stellar/contract"
import { DeployedContracts } from "@/lib/stellar/interfaces"
import { useProgram } from "../provider"

export const useWeb3Hook = () => {
    const { networkServer } = useProgram()
    const [contracts, setContracts] = useState<DeployedContracts>({})

    const executeSend = async (
        contractAddress: string,
        method: string,
        args: any[],
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
        args: any[]
    ) => {
        // contractAddress = getAddress(contractAddress)
        if (!contracts.hasOwnProperty(contractAddress)) {
            throw new Error("Contract not loaded")
        }

        return contracts[contractAddress].call({ method, args })
    }

    const removeContract = (contractAddress: string) => {
        // contractAddress = getAddress(contractAddress)
        if (contracts.hasOwnProperty(contractAddress)) {
            delete contracts[contractAddress]
            setContracts({ ...contracts })
        }
    }

    const doDeploy = async ({
        contractId,
        deployData,
    }: {
        contractId?: string
        deployData: string
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

        const result = {} as any
        // contractAddress = result.contract as string
        // setContracts({
        //     ...contracts,
        //     [contractAddress]: new SorobanSmartContract(contractAddress, abi),
        // })

        return result
    }

    return {
        executeCall,
        executeSend,
        doDeploy,

        contracts,
        removeContract,
    }
}
