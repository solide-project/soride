import { ChainID } from "./chain-id"

const data: { [key: string]: string } = {
    [ChainID.STELLAR_MAINNET]: "Public Global Stellar Network ; September 2015",
    [ChainID.STELLAR_TESTNET]: "Test SDF Network ; September 2015",
    [ChainID.STELLAR_FUTURENET]: "Test SDF Future Network ; October 2022",
}

export const getPassPhrase = (network: string): string =>
    data[network] || ""
