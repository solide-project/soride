"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

import { Title } from "@/components/core/components/title"
import { useProgram } from "@/components/soroban/provider"
import { ContractInvoke } from "@/components/soroban/deploy/contract-invoke"
import { CompileErrors } from "@/components/soroban/deploy/compile-errors"
import { ContractOverview } from "@/components/soroban/deploy/contract-overview"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface BuildDeployProps extends React.HTMLAttributes<HTMLDivElement> { }

enum Tab {
    OVERVIEW = "Overview",
    INTERACT = "Interact",
}

const tabsData = [
    { key: Tab.OVERVIEW, component: <ContractOverview /> },
    { key: Tab.INTERACT, component: <ContractInvoke /> },
]

export function BuildDeploy({ className }: BuildDeployProps) {
    const soroban = useProgram()
    const [activeTab, setActiveTab] = useState<Tab>(Tab.INTERACT)

    const isActive = (tab: string) => activeTab === tab

    return (
        <div className={cn("px-2 pb-4", className)}>
            <Title text="Build & Deploy" />

            {soroban.errors && soroban.errors.details && <CompileErrors />}

            <Select onValueChange={(val: string) => setActiveTab(val as Tab)}>
                <SelectTrigger className="w-full mb-2 bg-transparent border-none font-bold flex items-center justify-center space-x-4">
                    <SelectValue placeholder={Tab.INTERACT} />
                </SelectTrigger>
                <SelectContent>
                    {tabsData.map(x => x.key).map((tab, index) => (
                        <SelectItem key={index} value={tab}>{tab}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {tabsData.map((data) => {
                return (
                    <div key={data.key} className={cn({ hidden: !isActive(data.key) })}>
                        {data.component}
                    </div>
                )
            })}
        </div>
    )
}