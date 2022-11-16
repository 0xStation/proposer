import networks from "app/utils/networks.json"
import { Token } from "@prisma/client"
import { EvmChain } from "@moralisweb3/evm-utils"
import Moralis from "moralis"

Moralis.start({
  apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
})

// moralis only supports a few chains --
// what does that mean for what we are able to support in our own app?
const moralisChainMap: Record<string, EvmChain> = {
  "1": EvmChain.ETHEREUM,
  "5": EvmChain.GOERLI,
  "137": EvmChain.POLYGON,
  "80001": EvmChain.MUMBAI,
  "43114": EvmChain.AVALANCHE,
}

export const getMoralisNetwork = (chainId: number) => {
  return moralisChainMap[chainId.toString()] || EvmChain.ETHEREUM
}

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
