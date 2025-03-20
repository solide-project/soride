import { ChainID } from "./chain-id"

const data: { [key: string]: string } = {
    [ChainID.STELLAR_MAINNET]: "https://horizon-mainnet.stellar.org",
    [ChainID.STELLAR_TESTNET]: "https://soroban-testnet.stellar.org:443",
    [ChainID.STELLAR_FUTURENET]: "https://rpc-futurenet.stellar.org",
}

export const getRPC = (network: string): string =>
    data[network] || ""
