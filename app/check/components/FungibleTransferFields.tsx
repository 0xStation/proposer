import { AddressField } from "app/core/components/form/AddressField"
import { SelectTokenField } from "app/core/components/form/SelectTokenField"
import { TokenAmountField } from "app/core/components/form/TokenAmountField"
import WhenFieldChanges from "app/core/components/WhenFieldChanges"
import { getNetworkTokens } from "app/core/utils/networkInfo"

export const FungibleTransferFields = ({ formState, tokens }) => {
  return (
    <>
      {/* RECIPIENT */}
      <AddressField title="Recipient*" fieldName="recipientAddress" />
      {/* TOKEN */}
      <SelectTokenField
        title="Token*"
        subtitle="Only tokens on this checkbook's network are allowed"
        fieldName="token"
        tokens={tokens}
      />
      <WhenFieldChanges field="token" set="tokenAmount" to={""} />
      <TokenAmountField
        title="Amount*"
        // subtitle="Only tokens on this checkbook's network are allowed"
        fieldName="tokenAmount"
        token={formState.values.token}
      />
    </>
  )
}
