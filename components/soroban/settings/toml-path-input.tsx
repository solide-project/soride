import { Input } from "@/components/ui/input"
import { useProgram } from "@/components/soroban/provider";

interface TomlPathInputProps extends React.HTMLAttributes<HTMLDivElement> { }

export function TomlPathInput({ className }: TomlPathInputProps) {
    const { tomlPath, setTomlPath } = useProgram();

    return (
        <Input className="w-[65%]"
            placeholder="Entry Toml"
            value={tomlPath}
            onChange={(e) => setTomlPath(e.target.value)} />
    )
}