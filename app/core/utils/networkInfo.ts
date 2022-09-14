import networks from "app/utils/networks.json"
import { Token } from "@prisma/client"

export const getNetworkTokens = (chainId: number): Token[] => {
  try {
    const networkCoin = networks[chainId]?.coin
    const networkStablecoins = networks[chainId]?.stablecoins || []
    return [networkCoin, ...networkStablecoins]
  } catch {
    return []
  }
}

export const getNetworkExplorer = (chainId: number): string => {
  try {
    return networks[chainId].explorer
  } catch {
    return "N/A"
  }
}

export const getNetworkName = (chainId: number): string => {
  try {
    return networks[chainId].name
  } catch {
    return "N/A"
  }
}
