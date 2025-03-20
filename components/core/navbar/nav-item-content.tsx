"use client"

import path from "path"
import Link from "next/link"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { buttonVariants } from "@/components/ui/button"

interface NavItemContentProps extends React.HTMLAttributes<HTMLDivElement> {
  url: string
}

export function NavItemContent({ url }: NavItemContentProps) {
  const [icon, setIcon] = useState<IconName>("box")

  useEffect(() => {
    const { ext } = path.parse(url)
    ext && setIcon("github")
  }, [url])

  return (
    <Link
      href={url}
      target="_blank"
      className={cn(
        buttonVariants({ size: "icon", variant: "ghost" }),
        "cursor-pointer border-0 hover:bg-grayscale-100"
      )}
    >
      <DynamicIcon name={icon} />
    </Link>
  )
}
