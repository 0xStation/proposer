import { Terminal } from "app/terminal/types"
import { Checkbook } from "app/checkbook/types"
import useCheckbookAvailability from "app/core/hooks/useCheckbookAvailability"

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
  const tokenTotals = useCheckbookAvailability(checkbook, terminal)

  const validTokens =
    (tokenTotals &&
      tokenTotals.filter((token) => {
        return token.available > 0
      })) ||
    []

  return (
    <div>
      <select
        {...options}
        className={`w-full bg-wet-concrete border border-concrete rounded p-1 mt-3`}
      >
        <option>Select token</option>
        {validTokens.map((token, i) => {
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
