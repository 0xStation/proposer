import { Form } from "react-final-form"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { AddressField } from "app/core/components/form/AddressField"
import { SelectTokenField } from "app/core/components/form/SelectTokenField"
import { TokenAmountField } from "app/core/components/form/TokenAmountField"
import { useParam } from "@blitzjs/next"
import { getNetworkTokens } from "app/core/utils/networkInfo"
import WhenFieldChanges from "app/core/components/WhenFieldChanges"
import { useMutation } from "@blitzjs/rpc"
import createCheck from "../mutations/createCheck"
import { preparePaymentTransaction } from "app/transaction/payments"
import { TextField } from "app/core/components/form/TextField"
import { CheckType } from "../types"
import { useResolveEnsAddress } from "app/proposalForm/hooks/useResolveEnsAddress"

export const NewCheckFungibleForm = ({ goBack, onCreate }) => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const tokens = getNetworkTokens(checkbookChainId)
  const { resolveEnsAddress } = useResolveEnsAddress()

  const [createCheckMutation, { isLoading }] = useMutation(createCheck, {
    onSuccess: (check) => {
      console.log("check", check)
      onCreate()
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  return (
    <>
      <h1 className="text-2xl font-bold">Transfer fungible tokens (ETH or ERC20)</h1>
      <Form
        initialValues={{}}
        onSubmit={async (values, form) => {
          const recipient = await resolveEnsAddress(values.recipientAddress?.trim())
          const { to, value, data } = preparePaymentTransaction(
            recipient!,
            values.token,
            values.tokenAmount
          )

          console.log(to, value.toString(), data)

          createCheckMutation({
            chainId: checkbookChainId,
            address: checkbookAddress,
            title: values.title,
            to: to,
            value: value.toString(),
            data: data,
            meta: {
              type: CheckType.FungibleTransfer,
              recipient,
              token: values.token,
              amount: values.tokenAmount,
            },
          })
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          return (
            <form onSubmit={handleSubmit}>
              <TextField
                title="Title*"
                fieldName="title"
                placeholder="Enter a few words for accounting"
              />
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
              {/* BUTTONS */}
              <div className="mt-12 flex justify-between">
                <Button type={ButtonType.Unemphasized} onClick={goBack}>
                  Back
                </Button>
                <Button isSubmitType={true} isLoading={isLoading} isDisabled={formState.invalid}>
                  Next
                </Button>
              </div>
            </form>
          )
        }}
      />
    </>
  )
}
