import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UtilButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
}

export default function UtilButton({ children, className, ...props }: UtilButtonProps) {
    return (
        <Button size="sm" className={cn("w-full", className)} {...props}>
            {children}
        </Button>
    )
}