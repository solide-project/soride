"use client"

import * as React from "react"
import { useEffect, useState } from "react"

import { getIconByChainId, getNetworkNameFromChainID } from "@/lib/chains"

import { SelectedChain } from "@/components/core/components/selected-chain"

export const hexToDecimal = (hex: string): number => parseInt(hex, 16)
export const hexToString = (hex: string): string => hexToDecimal(hex).toString()

interface StylusSelectedChainProps extends React.HTMLAttributes<HTMLDivElement> { }

export function StylusSelectedChain({ }: StylusSelectedChainProps) {
    const [chainId, setChainId] = useState<string>("1501")

    useEffect(() => {
        ; (async () => {

        })()
    }, [])

    return (
        <SelectedChain
            name={getNetworkNameFromChainID(chainId)}
            src={getIconByChainId(chainId)}
        />
    )
}