import { useEffect, useState } from "react"
import useCheckbookFunds from "app/core/hooks/useCheckbookFunds"
import LinearProgressIndicator from "./LinearProgressIndicator"
import { formatUnits } from "ethers/lib/utils"
import { InformationCircleIcon } from "@heroicons/react/solid"
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
      <span className="mt-4 flex flex-row items-center group relative">
        <span className="text-xs font-bold uppercase tracking-wider text-concrete">
          available to deploy
        </span>
        <InformationCircleIcon className="h-4 w-4 ml-1 fill-light-concrete" />
        <div className="hidden group-hover:block absolute top-[100%] bg-wet-concrete p-2 rounded text-xs w-1/2">
          Token amount available minus pending network fee.{" "}
          <a className="text-electric-violet" href="#">
            Learn more.
          </a>
        </div>
      </span>
      <span className="text-2xl">{available}</span>
      <div className="mt-4">
        <LinearProgressIndicator value={cashed} max={total} color="magic-mint" title="Cashed" />
      </div>
      <div className="mt-4 relative group">
        <LinearProgressIndicator value={pending} max={total} color="neon-carrot" title="Pending" />
        {pending > available && (
          <span className="bg-wet-concrete border border-[#262626] text-marble-white text-xs p-2 rounded absolute top-[120%] left-[10%] w-[80%] group hidden group-hover:block shadow-lg z-50">
            Overallocated. You will not be able to approve all proposals.
          </span>
        )}
      </div>
    </div>
  )
}

export default CheckbookIndicator
