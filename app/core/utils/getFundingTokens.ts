import { Checkbook } from "app/checkbook/types"
import { Terminal } from "app/terminal/types"
import networks from "app/utils/networks.json"
import { TagType, TokenType } from "app/tag/types"

const getFundingTokens = (
  checkbook: Checkbook | undefined,
  terminal: Terminal | null | undefined
) => {
  return [
    // ETH gas coin if on mainnet or testnet
    ...([1, 4, 5].includes(checkbook?.chainId || 0) ? [{ symbol: "ETH", address: "" }] : []),
    // preferred stablecoins for network
    ...(networks[checkbook?.chainId as number]?.stablecoins || []),
    // ERC20 tokens imported to organization on same chain as checkbook
    ...(terminal?.tags
      .filter(
        (t) =>
          t.type === TagType.TOKEN &&
          t.data.type === TokenType.ERC20 &&
          t.data.chainId === checkbook?.chainId
      )
      .map((t) => {
        return { symbol: t.data.symbol, address: t.data.address }
      }) || []),
  ]
}

export default getFundingTokens
