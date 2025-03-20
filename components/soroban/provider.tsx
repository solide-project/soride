"use client"

import { CompileError } from "@/lib/stylus"
import React, { createContext, useContext, useEffect, useState } from "react"


export const SorobanProvider = ({ children }: SorobanProviderProps) => {
    const [tomlPath, setTomlPath] = useState<string>("")

    const [abi, setABI] = useState<string>("")
    const [errors, setErrors] = useState<CompileError>({} as CompileError)

    const [wasm, setWasm] = useState<Blob>({} as Blob)
    const [deployData, setDeployData] = useState<string>("")

    useEffect(() => {
    }, [])

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
                resetBuild
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
    setTomlPath: (path: string) => { },
    wasm: {} as Blob,
    setWasm: (wasm: Blob) => { },
    deployData: "",
    setDeployData: (data: string) => { },
    abi: "",
    setABI: (abi: string) => { },
    errors: {} as CompileError,
    setErrors: (errors: CompileError) => { },
    resetBuild: () => { }
})

export const useProgram = () => useContext(SorobanContext)