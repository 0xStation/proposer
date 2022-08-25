import networks from "app/utils/networks.json"

export const getNetworkName = (chainId: number): string => {
  try {
    return networks[chainId].name
  } catch {
    return "N/A"
  }
}
