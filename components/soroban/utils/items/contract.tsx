import { Input } from '@/components/ui/input';
import { useState } from 'react';
import UtilButton from '../components/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getContractHash, getContractId } from '@/lib/stellar/utils';
import UtilResult from '../components/result';

interface ContractConverterProps extends React.HTMLAttributes<HTMLButtonElement> {
}

export default function ContractConverter({ }: ContractConverterProps) {
    // true: to contract id, false: to contract hash
    const [switcher, setSwitcher] = useState(true)
    const [data, setData] = useState<string>("")
    const [result, setResult] = useState("")

    const handleClick = () => {
        try {
            const result = switcher ? getContractId(data) : getContractHash(data)
            setResult(result)
        } catch (e: any) {
            setResult(e.message)
        }
    }

    return (
        <>
            <Input type="text" placeholder="contract id or hash" value={data}
                onChange={(e) => setData(e.target.value)} />

            <div className="flex items-center justify-between space-y-2">
                <Checkbox checked={switcher} onCheckedChange={() => setSwitcher(!switcher)} />
                <div>To Id</div>
            </div>

            <UtilResult>
                {result.toString()}
            </UtilResult>

            <UtilButton onClick={handleClick}>
                To {switcher ? "Contract Id" : "Contract Hash"}
            </UtilButton>
        </>
    )
}