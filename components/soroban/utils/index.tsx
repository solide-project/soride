"use client"

import { Suspense, lazy, useState } from "react"

import { cn } from "@/lib/utils"
import { Title } from "@/components/core/components/title"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UtiltyTabProps extends React.HTMLAttributes<HTMLDivElement> { }

enum Tab {
  CONTRACT_CONVERT = "Contract Id Converter",
  UNIT_CONVERT = "XLM Unit Conversion",
  WASM_ABI = "WASM ABI",
}

const LazyContractConverter = lazy(() => import("@/components/soroban/utils/items/contract"))
const LazyUnitConverter = lazy(() => import("@/components/soroban/utils/items/unit"))
const LazyWasmToAbi = lazy(() => import("@/components/soroban/utils/items/abi"))

const tabsData = [
  { key: Tab.CONTRACT_CONVERT, component: <LazyContractConverter /> },
  { key: Tab.UNIT_CONVERT, component: <LazyUnitConverter /> },
  { key: Tab.WASM_ABI, component: <LazyWasmToAbi /> },

]

export function UtiltyTab({ className }: UtiltyTabProps) {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CONTRACT_CONVERT)

  const isActive = (tab: Tab) => activeTab === tab

  return (
    <div className={cn("px-2 pb-4", className)}>
      <Title text="Utility" />

      <Select onValueChange={(val: string) => setActiveTab(val as Tab)}>
        <SelectTrigger className="w-full mb-2 bg-transparent border-none font-bold flex items-center justify-center space-x-4">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          {tabsData.map(x => x.key).map((tab, index) => (
            <SelectItem key={index} value={tab}>{tab}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Suspense fallback={<div>Loading...</div>}>
        {tabsData.map((data) => {
          return (
            <div key={data.key} className={cn({ hidden: !isActive(data.key) })}>
              {data.component}
            </div>
          )
        })}
      </Suspense>
    </div>
  )
}
