import { ExternalNetwork, Network } from '../type/network.type'
import { Provider } from '../type/provider.type'

export const isNetworkIdFromTestnet = (networkId: string): boolean => {
  const id = networkId.toUpperCase()

  return (
    id.includes('TESTNET') ||
    id.includes('_T') ||
    id.includes('SEPOLIA') ||
    id.includes('KOVAN') ||
    id.includes('HOLESKY') ||
    id.includes('DEVNET') ||
    id.includes('BAKLAVA')
  )
}

/**
 * Checks if a network is a testnet based on its SLIP-44 coin type. Based on
 * the standard, coin type 1 is reserved to all testnets.
 *
 * @see https://github.com/satoshilabs/slips/blob/master/slip-0044.md#registered-coin-types
 */
export const isTestnet = (network: Network): boolean => {
  return Boolean(network.coinType && network.coinType === 1)
}

export const getExternalNetwork = (network: Network, provider: Provider): ExternalNetwork | null => {
  return network.externalNetworks.find((externalNetwork) => externalNetwork.provider === provider) || null
}
