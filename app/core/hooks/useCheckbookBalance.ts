import { formatUnits } from "ethers/lib/utils"
import useCheckbookFunds from "app/core/hooks/useCheckbookFunds"
import getFundingTokens from "app/core/utils/getFundingTokens"
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"

// returns a map of
// token address -> {available, pending, total, cashed}
const useCheckbookBalance = (rfp: Rfp, terminal: Terminal) => {
  const tokenOptions = getFundingTokens(rfp.checkbook, terminal)

  const map = tokenOptions.reduce((acc, token) => {
    const address = token.address
    const funds = useCheckbookFunds(
      rfp.checkbook?.chainId as number,
      rfp.checkbook?.address as string,
      rfp.checkbook?.quorum as number,
      address
    )
    const total = formatUnits(funds?.total, funds?.decimals)
    const available = formatUnits(funds?.available, funds?.decimals)
    const pending = formatUnits(funds?.pending, funds?.decimals)
    const cashed = formatUnits(funds?.cashed, funds?.decimals)

    acc[address] = { total, available, pending, cashed }
    return acc
  }, {})

  return map
}

export default useCheckbookBalance
