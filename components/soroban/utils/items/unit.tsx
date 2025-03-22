import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { stroopToXlm, xlmToStroop } from '@/lib/stellar/utils';
import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import UtilButton from '../components/button';
import UtilResult from '../components/result';

interface UnitConverterProps extends React.HTMLAttributes<HTMLButtonElement> {
}

export default function UnitConverter({ }: UnitConverterProps) {
    // true: xlm to stroop, false: stroop to xlm
    const [switcher, setSwitcher] = useState(false)
    const [data, setData] = useState<string>("0")
    const [result, setResult] = useState(BigNumber(0))

    const handleClick = () => {
        const result = switcher ? xlmToStroop(BigNumber(data)) : stroopToXlm(BigNumber(data))
        setResult(result)
    }

    return (
        <>
            <Input type="text" placeholder="value" value={data}
                onChange={(e) => setData(e.target.value)} />

            <div className="flex items-center justify-between my-2">
                <Checkbox checked={switcher} onCheckedChange={() => setSwitcher(!switcher)} />
                <div>To Stroop</div>
            </div>

            <UtilResult>
                {result.toString()}
            </UtilResult>

            <UtilButton onClick={handleClick}>
                To {switcher ? "XLM" : "Stroop"}
            </UtilButton>
        </>
    )
}