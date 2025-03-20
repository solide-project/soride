"use client"

import { NavItem } from "@/components/core/navbar/components/nav-item"

interface NavItemObjectProps
    extends React.HTMLAttributes<HTMLButtonElement> {
}

export const OBJECT_KEY = "object"

export function NavItemObject({
    ...props
}: NavItemObjectProps) {
    return (
        <NavItem name="blocks" navKey={OBJECT_KEY} {...props} />
    )
}