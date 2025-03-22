"use client"

import * as React from "react"

import { useProgram } from "@/components/soroban/provider"
import { useLogger } from "@/components/core/providers/logger-provider";
import { Button } from "@/components/ui/button";
import { CopyText } from "@/components/core/components/copy-text";

interface ContractOverviewProps extends React.HTMLAttributes<HTMLDivElement> { }

export function ContractOverview({ }: ContractOverviewProps) {
    const soroban = useProgram();
    const logger = useLogger();

    const downloadWasm = () => {
        if (!soroban.wasm) return;

        logger.info("Downloading wasm file...");

        console.log(soroban.wasm)
        const url = window.URL.createObjectURL(soroban.wasm);

        var link = document.createElement("a"); // Or maybe get it from the current document
        link.href = url;
        link.download = "contract.wasm";
        link.click();
    }

    return <div className="h-full overflow-y-auto px-4">
        {soroban.deployData &&
            <div>
                {soroban.deployData.slice(0, 100)}
                <CopyText title="Bytecode" payload={soroban.deployData || ""} />
            </div>}
        {soroban.wasm && <div className="flex flex-col justify-between lg:flex-row">
            <Button onClick={downloadWasm}>Download Wasm</Button>
        </div>}
    </div>
}