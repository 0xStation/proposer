import getFundingTokens from "app/core/utils/getFundingTokens"

// A component that shows a dropdown of the tokens in a given checkbook
const CheckbookSelect = ({ terminal, checkbook, options }) => {
  const tokenOptions = getFundingTokens(checkbook, terminal)

  return (
    <div>
      <select
        {...options}
        className={`w-full bg-wet-concrete border border-concrete rounded p-1 mt-3`}
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
  )
}

export default CheckbookSelect
