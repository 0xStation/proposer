import networks from "app/utils/networks.json"
import { Token } from "app/token/types"

export const getNetworkCoin = (chainId: number): Token | undefined => {
  try {
    return { ...networks[chainId]?.coin, chainId }
  } catch {
    return undefined
  }
}

export const getNetworkTokens = (chainId: number): Token[] => {
  try {
    const networkCoin = networks[chainId]?.coin
    const networkStablecoins = networks[chainId]?.stablecoins || []
    return [networkCoin, ...networkStablecoins].map((token) => {
      return { ...token, chainId }
    })
  } catch {
    return []
  }
}

export const getNetworkUsdc = (chainId: number): Token => {
  const stablecoins = (networks[chainId]?.stablecoins || []).map((token) => {
    return { ...token, chainId }
  })
  return stablecoins.find((token) => token.symbol === "USDC")
}

export const getNetworkExplorer = (chainId: number): string => {
  try {
    return networks[chainId].explorer
  } catch {
    return ""
  }
}

export const getNetworkGnosisUrl = (chainId: number): string => {
  try {
    return networks[chainId].gnosisUrl
  } catch {
    return ""
  }
}

export const getNetworkName = (chainId: number): string => {
  try {
    return networks[chainId].name
  } catch {
    return ""
  }
}

export const getNetworkSymbol = (chainId: number): string => {
  try {
    return networks[chainId].symbol
  } catch {
    return ""
  }
}

export const getNetworkNftUrl = (chainId: number, address: string, tokenId: number): string => {
  try {
    const baseUrl = networks[chainId].nftUrl
    return `${baseUrl}/${address}/${tokenId}`
  } catch {
    return ""
  }
}
