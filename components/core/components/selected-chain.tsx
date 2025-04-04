"use client"

import Image from "next/image"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

interface SelectedChainProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  src: string
}

export function SelectedChain({ name, src }: SelectedChainProps) {
  return <HoverCard openDelay={0}>
    <HoverCardTrigger>
      <Image width={50} height={50} alt="Network Icon"
        loader={() => src} src={src}
        className={cn(
          buttonVariants({ size: "icon", variant: "none" }),
          "h-5 w-5 cursor-pointer sm:h-8 sm:w-8"
        )}
      />
    </HoverCardTrigger>
    <HoverCardContent>{name || "Unsupported Network"}</HoverCardContent>
  </HoverCard>
}
