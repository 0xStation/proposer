import networks from "app/utils/networks.json"

export const getNetworkExplorer = (chainId: number): string => {
  try {
    return networks[chainId].explorer
  } catch {
    return "N/A"
  }
}
