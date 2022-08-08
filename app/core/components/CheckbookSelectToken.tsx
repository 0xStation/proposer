import getFundingTokens from "app/core/utils/getFundingTokens"
import { Terminal } from "app/terminal/types"
import { Checkbook } from "app/checkbook/types"

// A component that shows a dropdown of the tokens in a given checkbook
const CheckbookSelectToken = ({
  terminal,
  checkbook,
  options,
}: {
  terminal: Terminal
  checkbook: Checkbook
  options?: any
}) => {
  const tokenOptions = getFundingTokens(checkbook.chainId, checkbook, terminal)

  return (
    <div>
      <select
        {...options}
        className={`w-full bg-wet-concrete border border-concrete rounded p-2 mt-3`}
      >
        <option>Select token</option>
        {tokenOptions.map((token, i) => {
          return (
            <option key={i} value={token.address}>
              {token.symbol}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export default CheckbookSelectToken
