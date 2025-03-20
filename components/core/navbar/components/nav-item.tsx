"use client"

import { DynamicIcon, IconName } from "lucide-react/dynamic"
import { useNav } from "../provider"
import { NavButton } from "./nav-button"

interface NavItemProps extends React.HTMLAttributes<HTMLButtonElement> {
    name: IconName
    navKey?: string
}

export function NavItem({ name, navKey = "dsf", ...props }: NavItemProps) {
    const { isNavItemActive, setNavItemActive } = useNav()

    const handleOnClick = async (event: any) => {
        navKey && setNavItemActive(navKey)
        props.onClick && props.onClick(event)
    }

    return (
        <NavButton onClick={handleOnClick} {...props}>
            <DynamicIcon name={name} className={isNavItemActive(navKey) ? "" : "text-grayscale-250"} />
        </NavButton>
    )
}