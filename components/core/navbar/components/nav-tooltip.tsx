import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"


interface NavTooltiprProps extends React.HTMLAttributes<HTMLDivElement> {
    content?: string
}

export const NavTooltip = ({ children, content }: NavTooltiprProps) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild={true}>
                <div>
                    {children}
                </div>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>{content}</p>
            </TooltipContent>
        </Tooltip>
    )
}