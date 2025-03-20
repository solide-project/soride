"use client"

import { CODE_KEY } from "./keys"
import { NavItem } from "./components/nav-item"

interface NavItemCodeProps extends React.HTMLAttributes<HTMLButtonElement> { }

export function NavItemCode({ ...props }: NavItemCodeProps) {
  return (
    <NavItem name="hammer" navKey={CODE_KEY} {...props} />
  )
}
