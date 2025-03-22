"use client"

import { useEffect, useRef, useState } from "react"

import { ChainID, getIconByChainId, getNetworkNameFromChainID } from "@/lib/chains"

import { SelectedChain } from "@/components/core/components/selected-chain"
import { WatchWalletChanges } from "@stellar/freighter-api"
import { useProgram } from "./provider"
import { useTheme } from "next-themes"

interface SorobanSelectedChainProps extends React.HTMLAttributes<HTMLDivElement> { }

export function SorobanSelectedChain({ }: SorobanSelectedChainProps) {
    const { setSelectedNetwork } = useProgram();
    const { theme } = useTheme()
    const [chainId, setChainId] = useState(ChainID.STELLAR_TESTNET);

    const Watcher = new WatchWalletChanges(1000);
    const watcherRef = useRef(Watcher);

    useEffect(() => {
        watcherRef.current.watch((result) => {
            let chainId = ChainID.STELLAR_TESTNET
            if (result.network === "TESTNET") {
                chainId = ChainID.STELLAR_TESTNET
            } else if (result.network === "PUBLIC") {
                chainId = ChainID.STELLAR_MAINNET
            }
            setChainId(chainId);
            setSelectedNetwork(chainId)
        });
    }, [])

    return (
        <SelectedChain
            name={getNetworkNameFromChainID(chainId)}
            src={getIconByChainId(chainId, theme)}
        />
    )
}