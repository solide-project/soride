import { Button } from '@/components/ui/button';
import { getAddress, isAllowed, isConnected, requestAccess, setAllowed } from '@stellar/freighter-api';
import { useEffect, useState } from 'react';

interface ConnectWalletProps extends React.HTMLAttributes<HTMLButtonElement> {
}

export function ConnectWallet({ }: ConnectWalletProps) {
    const [userAddress, setUserAddress] = useState("")

    const loadUser = () => {
        getAddress().then(result => {
            console.log(result.address)
            setUserAddress(result.address || "")
        })
    }

    const mask = (address: string): string => {
        if (!address) return "";
        if (address.length < 10) return address;
        return `${address.slice(0, 6)}...${address.slice(-3)}`;
    }

    useEffect(() => {
        loadUser()
    }, [])

    const authenticate = async () => {
        const connected = await isAllowed()
        console.log(connected)
        if (!connected.isAllowed) {
            await requestAccess()
        }

        const { address } = await getAddress()
        if (!address) {
            await requestAccess()
        }
        loadUser()
    }

    const logout = async () => {
        setUserAddress("")
    }

    return (
        <Button onClick={() => { (userAddress ? logout : authenticate)() }}>
            {userAddress ? mask(userAddress) : "Connect Wallet"}
        </Button >
    )
}