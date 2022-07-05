import { useEffect, useState } from "react"
import useCheckbookFunds from "app/core/hooks/useCheckbookFunds"
import LinearProgressIndicator from "./LinearProgressIndicator"
import { formatUnits } from "ethers/lib/utils"
import getFundingTokens from "app/core/utils/getFundingTokens"

// A component that shows a dropdown of the tokens in a given checkbook
// and indicators for the levels of those tokens that are used / pending / available
const CheckbookIndicator = ({ terminal, checkbook }) => {
  const tokenOptions = getFundingTokens(checkbook, terminal)
  const [selectedFundsToken, setSelectedFundsToken] = useState<string>()

  // needed to fetch data for first page load
  useEffect(() => {
    if (tokenOptions.length > 0 && !selectedFundsToken) {
      setSelectedFundsToken(tokenOptions[0].address)
    }
  }, [tokenOptions])

  const selectedFunds = useCheckbookFunds(
    checkbook?.chainId as number,
    checkbook?.address as string,
    checkbook?.quorum as number,
    selectedFundsToken
  )

  const total = formatUnits(selectedFunds?.total, selectedFunds?.decimals)
  const available = formatUnits(selectedFunds?.available, selectedFunds?.decimals)
  const pending = formatUnits(selectedFunds?.pending, selectedFunds?.decimals)
  const cashed = formatUnits(selectedFunds?.cashed, selectedFunds?.decimals)

  return (
    <div>
      <div>
        <select
          className={`w-full bg-wet-concrete border border-concrete rounded p-1 mt-3`}
          onChange={({ target: { options, selectedIndex } }) => {
            setSelectedFundsToken(options[selectedIndex]?.value || "")
          }}
        >
          {tokenOptions.map((token, i) => {
            return (
              <option key={i} value={token.address}>
                {token.symbol}
              </option>
            )
          })}
        </select>
      </div>
      <span className="text-xs text-concrete mt-2 block">
        {available}/{total} available to deploy
      </span>
      <div className="mt-4">
        <LinearProgressIndicator value={cashed} max={total} color="magic-mint" title="Cashed" />
      </div>
      <div className="mt-4">
        <LinearProgressIndicator value={pending} max={total} color="neon-carrot" title="Pending" />
      </div>
    </div>
  )
}

export default CheckbookIndicator
