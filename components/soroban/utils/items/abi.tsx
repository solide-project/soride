import { Input } from '@/components/ui/input';
import { useState } from 'react';
import UtilButton from '../components/button';
import { Checkbox } from '@/components/ui/checkbox';
import UtilResult from '../components/result';
import { useProgram } from '../../provider';
import { _code, _specs, _abi } from '@/lib/stellar/soroban-contract';
import { hexToByte } from '@/lib/stellar/utils';
import { Abi, AbiFunction, AbiType } from '@/lib/stellar/abi';
import { Button } from '@/components/ui/button';
import { useLogger } from '@/components/core/providers/logger-provider';

interface WasmToAbiProps extends React.HTMLAttributes<HTMLButtonElement> {
}

export default function WasmToAbi({ }: WasmToAbiProps) {
    const { networkServer } = useProgram()
    const [data, setData] = useState<string>("")
    const [result, setResult] = useState("[]")
    const [error, setError] = useState("")
    const [selectedAbiParameter, setSelectedAbiParameter] =
        useState<AbiType | null>(null)

    const handleClick = async () => {
        try {
            setResult("[]")
            setError("")
            setSelectedAbiParameter(null)
            const code = await _code(networkServer, hexToByte(data));
            const specs = await _specs(code);
            const abi = await _abi(specs);
            setResult(JSON.stringify(abi))
            console.log(abi)
        } catch (e: any) {
            setError(e.message)
        }
    }

    return (
        <>
            <Input type="text" placeholder="Wasm Id" value={data}
                onChange={(e) => setData(e.target.value)} />

            {error && error}
            {result && <div className="flex flex-wrap gap-2">
                {(JSON.parse(result) as Abi)
                    // .filter((abi) => abi.type === "function")
                    .map((abi: AbiType, methodsIndex: number) => {
                        return (
                            <Button
                                key={methodsIndex}
                                onClick={() => setSelectedAbiParameter(abi)}
                                size="sm"
                            >
                                {abi.name}
                            </Button>
                        )
                    })}
            </div>}

            {JSON.stringify(selectedAbiParameter)}

            <UtilButton onClick={handleClick}>
                Get ABI
            </UtilButton>
        </>
    )
}