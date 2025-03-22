"use client"

import { NavItemCode } from "@/components/core/navbar/nav-item-code"
import { NavItemEditor } from "@/components/core/navbar/nav-item-editor"
import { NavItemFile } from "@/components/core/navbar/nav-item-file"
import { NavItemTheme } from "@/components/core/navbar/nav-item-theme"
import { NavItemConsole } from "@/components/core/navbar/nav-item-console"
import { ProgramSettings } from "@/components/soroban/settings"
import { SorobanSelectedChain } from "../selected-chain"
import { NavItemLoader } from "./nav-item-loader"
import { NavTooltip } from "../../core/navbar/components/nav-tooltip"
import { NavItemDownloader } from "@/components/core/navbar/nav-item-downloader"
import { NavItemUtility } from "./nav-item-utilty"

interface SorobanNavBarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function SorobanNavBar({ }: SorobanNavBarProps) {
    return (
        <div className="flex h-full flex-col gap-y-2 rounded-lg bg-grayscale-025 px-2 py-4">
            <NavTooltip content="File Explorer">
                <NavItemFile />
            </NavTooltip>
            <NavTooltip content="Build & Deploy">
                <NavItemCode />
            </NavTooltip>
            <NavTooltip content="Editor">
                <NavItemEditor />
            </NavTooltip>
            <NavTooltip content="Console">
                <NavItemConsole />
            </NavTooltip>
            <NavTooltip content="Load New Contract">
                <NavItemLoader />
            </NavTooltip>
            <NavTooltip content="Utility">
                <NavItemUtility />
            </NavTooltip>

            <div className="mt-auto flex flex-col items-center gap-2">
                <SorobanSelectedChain />
                <NavItemTheme />
                <ProgramSettings />
            </div>
        </div>
    )
}
