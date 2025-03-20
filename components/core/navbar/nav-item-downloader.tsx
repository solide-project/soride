"use client"

import { downloadBlob, zipSources } from "@/lib/core"

import { useLogger } from "../providers/logger-provider"
import { NavItem } from "./components/nav-item"
import { useFileSystem } from "../providers/file-provider"

interface NavItemDownloaderProps
  extends React.HTMLAttributes<HTMLButtonElement> {
}

export function NavItemDownloader({
  ...props
}: NavItemDownloaderProps) {
  const logger = useLogger()
  const fs = useFileSystem()

  const handleOnClick = async (event: any) => {
    try {
      const payload = await zipSources(await fs.generateSources())
      logger.info(`Downloading contract... ${payload.size} bytes`)

      downloadBlob({
        source: payload,
        name: "contract.zip",
      })
    } catch (error) {
      logger.error("Failed to download contract.")
    }
  }

  return (
    <NavItem name="download" onClick={handleOnClick} {...props} />
  )
}
