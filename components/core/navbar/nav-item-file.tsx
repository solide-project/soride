"use client"
import { NavItem } from "./components/nav-item"
import { FILE_KEY } from "./keys"

interface NavItemFileProps extends React.HTMLAttributes<HTMLButtonElement> { }

export function NavItemFile({ ...props }: NavItemFileProps) {
  return (
    <NavItem name="file-json-2" navKey={FILE_KEY} {...props} />
  )
}
