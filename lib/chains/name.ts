import { ChainID } from "./chain-id"

const data: { [key: string]: string } = {
    [ChainID.STELLAR_MAINNET]: "Stellar Mainnet",
    [ChainID.STELLAR_TESTNET]: "Stellar Testnet",
    [ChainID.STELLAR_FUTURENET]: "Stellar Futurenet",
}

export const getNetworkNameFromChainID = (network: string): string =>
    data[network] || ""