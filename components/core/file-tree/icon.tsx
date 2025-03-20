import { cn } from '@/lib/utils';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';

interface FileIconProps extends React.HTMLAttributes<SVGSVGElement> {
    name: IconName
    size?: number
}

export const FileIcon = ({
    name = "home",
    size = 18,
    className,
    ...props
}: FileIconProps) => {
    return (
        <DynamicIcon name={name} size={size} className={cn("shrink-0 hover:text-primary cursor-pointer", className)} {...props} />
    )
}