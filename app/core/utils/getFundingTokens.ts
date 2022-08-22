import { Checkbook } from "app/checkbook/types"
import { Terminal } from "app/terminal/types"
import networks from "app/utils/networks.json"
import { TagType } from "app/tag/types"
import { TokenType } from "app/types/token"
import { ETH_METADATA, CHAIN_IDS } from "./constants"

const getFundingTokens = (
  checkbook: Checkbook | undefined,
  terminal: Terminal | null | undefined
) => {
  const eth = [CHAIN_IDS.ETHEREUM, CHAIN_IDS.RINKEBY, CHAIN_IDS.GOERLI].includes(
    checkbook?.chainId || 0
  )
    ? [ETH_METADATA]
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
        return { symbol: t.data.symbol, address: t.data.address, decimals: t.data.decimals }
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
