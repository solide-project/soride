import { cn } from "@/lib/utils";

interface UtilResultProps extends React.HTMLAttributes<HTMLDivElement> {
}

export default function UtilResult({ children, className, ...props }: UtilResultProps) {
    return (
        <div className={cn("my-2 break-all", className)} {...props}>
            {children}
        </div>
    )
}