import { Checkbook } from "app/checkbook/types"
import { Terminal } from "app/terminal/types"
import networks from "app/utils/networks.json"
import { TagType, TokenType } from "app/tag/types"
import { zeroAddress, chainIds } from "./constants"

const getFundingTokens = (
  checkbook: Checkbook | undefined,
  terminal: Terminal | null | undefined
) => {
  const eth = [chainIds.ETHEREUM, chainIds.RINKEBY, chainIds.GOERLI].includes(
    checkbook?.chainId || 0
  )
    ? [{ symbol: "ETH", address: zeroAddress }]
    : []

  const stablecoins = networks[checkbook?.chainId as number]?.stablecoins || []

  const tokenTags =
    terminal?.tags
      .filter(
        (t) =>
          t.type === TagType.TOKEN &&
          t.data.type === TokenType.ERC20 &&
          t.data.chainId === checkbook?.chainId &&
          !stablecoins.map((s) => s.address).includes(t.data.address)
      )
      .map((t) => {
        return { symbol: t.data.symbol, address: t.data.address }
      }) || []

  return [
    // ETH gas coin if on mainnet or testnet
    ...eth,
    // preferred stablecoins for network
    ...stablecoins,
    // ERC20 tokens imported to organization on same chain as checkbook
    ...tokenTags,
  ]
}

export default getFundingTokens