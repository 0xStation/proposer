import { Token } from "@prisma/client"
import networks from "app/utils/networks.json"
import { COIN_METADATA } from "../constants"

export const getNetworkTokens = (chainId: number): Token[] => {
  try {
    const networkCoin = { ...networks[chainId]?.coin, ...COIN_METADATA }
    const networkStablecoins = networks[chainId]?.stablecoins || []
    return [networkCoin, ...networkStablecoins]
  } catch {
    return []
  }
}
