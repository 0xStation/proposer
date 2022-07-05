import { useState } from "react"
import useCheckbookFunds from "app/core/hooks/useCheckbookFunds"
import LinearProgressIndicator from "./LinearProgressIndicator"
import CheckbookSelect from "./CheckbookSelect"
import { formatUnits } from "ethers/lib/utils"

// A component that shows a dropdown of the tokens in a given checkbook
// and indicators for the levels of those tokens that are used / pending / available
const CheckbookIndicator = ({ terminal, checkbook }) => {
  const [selectedFundsToken, setSelectedFundsToken] = useState<string>()

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
      <CheckbookSelect
        terminal={terminal}
        checkbook={checkbook}
        onChange={({ target: { options, selectedIndex } }) => {
          setSelectedFundsToken(options[selectedIndex]?.value)
        }}
      />
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
