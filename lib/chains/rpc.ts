import { ChainID } from "./chain-id"

const data: { [key: string]: `https://${string}` } = {
    [ChainID.STELLAR_MAINNET]: "https://mainnet.sorobanrpc.com",
    [ChainID.STELLAR_TESTNET]: "https://soroban-testnet.stellar.org",
    [ChainID.STELLAR_FUTURENET]: "https://rpc-futurenet.stellar.org",
}

export const getRPC = (network: string = ChainID.STELLAR_TESTNET): `https://${string}` =>
    data[network]
