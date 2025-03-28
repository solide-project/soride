import { ChainID } from "./chain-id"

const data: { [key: string]: string } = {
    [ChainID.STELLAR_MAINNET]: "https://stellar.expert/explorer/public",
    [ChainID.STELLAR_TESTNET]: "https://stellar.expert/explorer/testnet",
    [ChainID.STELLAR_FUTURENET]: "https://futurenet.stellarchain.io",
}

export const getExplorer = (network: string): string => data[network.toLocaleLowerCase()] || ""

export const getContractExplorer = (network: string, contract: string): string =>
    `${getExplorer(network)}/contract/${contract}`

export const getTransactionExplorer = (network: string, tx: string): string =>
    `${getExplorer(network)}/tx/${tx}`
