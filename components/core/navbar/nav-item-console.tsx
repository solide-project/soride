"use client"

import { NavItem } from "./components/nav-item"
import { CONSOLE_KEY } from "./keys"

interface NavItemConsoleProps extends React.HTMLAttributes<HTMLButtonElement> { }

export function NavItemConsole({ ...props }: NavItemConsoleProps) {
  return (
    <NavItem name="gamepad-2" navKey={CONSOLE_KEY} {...props} />
  )
}
