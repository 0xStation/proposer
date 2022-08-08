import { Checkbook } from "app/checkbook/types"
import { Terminal } from "app/terminal/types"
import networks from "app/utils/networks.json"
import { TagType, TokenType } from "app/tag/types"
import { ZERO_ADDRESS, CHAIN_IDS } from "./constants"

const getFundingTokens = (
  chainId: number,
  checkbook: Checkbook | undefined,
  terminal: Terminal | null | undefined
) => {
  const selectedChainId = checkbook ? checkbook.chainId : chainId

  const eth = [CHAIN_IDS.ETHEREUM, CHAIN_IDS.RINKEBY, CHAIN_IDS.GOERLI].includes(selectedChainId)
    ? [{ symbol: "ETH", address: ZERO_ADDRESS, decimals: 18 }]
    : []

  const stablecoins = networks[selectedChainId]?.stablecoins || []

  const tokenTags =
    terminal?.tags
      .filter(
        (t) =>
          t.type === TagType.TOKEN &&
          t.data.type === TokenType.ERC20 &&
          t.data.chainId === selectedChainId &&
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
