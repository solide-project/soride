import { ChainID } from "./chain-id"

export const getIconByChainId = (chainId: string): string =>
    `https://raw.githubusercontent.com/solide-project/icons/master/crypto/${getIcon(chainId)}`

const getIcon = (chainId: string): string => {
    switch (chainId) {
        case ChainID.STELLAR_FUTURENET:
        case ChainID.STELLAR_MAINNET:
        case ChainID.STELLAR_TESTNET:
        default:
            return "stellar.svg"
    }
}