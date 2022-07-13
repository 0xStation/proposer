import getFundingTokens from "app/core/utils/getFundingTokens"
import { Terminal } from "app/terminal/types"
import { Checkbook } from "app/checkbook/types"
import useCheckbookAvailable from "app/core/hooks/useCheckbookAvailable"

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
  const t = useCheckbookAvailable(checkbook.chainId, checkbook.address, checkbook.quorum, [
    "0x0000000000000000000000000000000000000000",
    "0xeb8f08a975Ab53E34D8a0330E0D34de942C95926",
  ])
  const tokenOptions = getFundingTokens(checkbook, terminal)

  return (
    <div>
      <select
        {...options}
        className={`w-full bg-wet-concrete border border-concrete rounded p-1 mt-3`}
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
