import { getNetworkExplorer } from "./networkInfo"

export const getTransactionLink = (chainId, transactionHash) => {
  return `${getNetworkExplorer(chainId)}/tx/${transactionHash}`
}
