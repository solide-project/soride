"use client"

import { NavItem } from "@/components/core/navbar/components/nav-item"

interface NavItemUtilityProps extends React.HTMLAttributes<HTMLButtonElement> { }

export const UTILITY_KEY = "utility"
export function NavItemUtility({ ...props }: NavItemUtilityProps) {
  return (
    <NavItem name="wrench" navKey={UTILITY_KEY} {...props} />
  )
}
