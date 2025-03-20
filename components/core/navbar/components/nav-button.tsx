"use client"

import { Button } from "@/components/ui/button"

interface NavButtonProps extends React.HTMLAttributes<HTMLButtonElement> { }

export function NavButton({ children, ...props }: NavButtonProps) {
    return (
        <Button
            className="cursor-pointer border-0 hover:bg-grayscale-100"
            size="icon"
            variant="ghost"
            {...props}
        >
            {children}
        </Button>
    )
}