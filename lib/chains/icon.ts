import { ChainID } from "./chain-id"

export const getIconByChainId = (chainId: string, theme: string = "light"): string =>
    // `https://raw.githubusercontent.com/solide-project/icons/master/crypto/${getIcon(chainId)}`
    `images/${getIcon(chainId, theme)}`

const getIcon = (chainId: string, theme: string = "light"): string => {
    switch (chainId) {
        case ChainID.STELLAR_FUTURENET:
        case ChainID.STELLAR_MAINNET:
        case ChainID.STELLAR_TESTNET:
        default:
            return `stellar-${(theme === "light" ? "light" : "dark")}.svg`
    }
}