"use client"

import { NavItem } from "./components/nav-item"
import { EDITOR_KEY } from "./keys"

interface NavItemEditorProps extends React.HTMLAttributes<HTMLButtonElement> { }

export function NavItemEditor({ ...props }: NavItemEditorProps) {
  return (
    <NavItem name="code-xml" navKey={EDITOR_KEY} {...props} />
  )
}
