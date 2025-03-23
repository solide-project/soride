"use client"

import { ChainID } from "@/lib/chains"
import { getServer } from "@/lib/stellar/server"
import { CompileError } from "@/lib/soroban"
import { rpc } from "@stellar/stellar-sdk"
import React, { createContext, useContext, useEffect, useState } from "react"
import { Abi } from "@/lib/stellar/abi"

export const SorobanProvider = ({ children }: SorobanProviderProps) => {
    const [tomlPath, setTomlPath] = useState<string>("")

    const [abi, setABI] = useState<Abi>([])
    const [errors, setErrors] = useState<CompileError>({} as CompileError)

    const [wasm, setWasm] = useState<Blob>({} as Blob)
    const [deployData, setDeployData] = useState<string>("")

    const [selectedNetwork, setSelectedNetwork] = useState<string>(ChainID.STELLAR_TESTNET)
    const [networkServer, setNetworkServer] = useState<rpc.Server>(getServer(selectedNetwork))

    useEffect(() => {
        setNetworkServer(getServer(selectedNetwork))
    }, [selectedNetwork])

    const resetBuild = () => {
        setErrors({} as CompileError)
        setWasm({} as Blob)
        setDeployData("")
    }

    return (
        <SorobanContext.Provider
            value={{
                tomlPath,
                setTomlPath,
                wasm,
                setWasm,
                deployData,
                setDeployData,
                abi,
                setABI,
                errors,
                setErrors,
                resetBuild,
                selectedNetwork,
                setSelectedNetwork,
                networkServer,
                setNetworkServer,
            }}
        >
            {children}
        </SorobanContext.Provider>
    )
}

interface SorobanProviderProps extends React.HTMLAttributes<HTMLDivElement> {
    name?: string
}

export const SorobanContext = createContext({
    tomlPath: "",
    setTomlPath: (_: string) => { },
    wasm: {} as Blob,
    setWasm: (_: Blob) => { },
    deployData: "",
    setDeployData: (_: string) => { },
    abi: [] as Abi,
    setABI: (_: Abi) => { },
    errors: {} as CompileError,
    setErrors: (_: CompileError) => { },
    resetBuild: () => { },
    selectedNetwork: "",
    setSelectedNetwork: (_: string) => { },
    networkServer: {} as rpc.Server,
    setNetworkServer: (_: rpc.Server) => { },

})

export const useProgram = () => useContext(SorobanContext)