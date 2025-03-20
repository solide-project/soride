
"use client"

import * as React from "react"
import { EditorProvider } from "@/components/core/providers/editor-provider"
import { FileSystemProvider } from "@/components/core/providers/file-provider"
import { LoggerProvider } from "@/components/core/providers/logger-provider"
import { NavProvider } from "@/components/core/navbar/provider"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

export interface NativeProvidersProps {
    nonce?: string;
    children?: React.ReactNode;
}

export function NativeProviders({ children, ...props }: NativeProvidersProps) {
    return <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
        <LoggerProvider>
            <FileSystemProvider>
                <EditorProvider>
                    <TooltipProvider delayDuration={0}>
                        <NavProvider>{children}</NavProvider>
                    </TooltipProvider>
                </EditorProvider>
            </FileSystemProvider>
        </LoggerProvider>
    </ThemeProvider>
}
