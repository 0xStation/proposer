import { useQuery, invoke, useMutation } from "@blitzjs/rpc"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import { useInbox } from "app/inbox/hooks/useInbox"
import { Form } from "react-final-form"
import { getNetworkTokens } from "app/core/utils/networkInfo"
import { useResolveEnsAddress } from "app/proposalForm/hooks/useResolveEnsAddress"
import createCheck from "app/check/mutations/createCheck"
import { preparePaymentTransaction } from "app/transaction/payments"
import { CheckType } from "app/check/types"
import { AddressField } from "app/core/components/form/AddressField"
import { SelectTokenField } from "app/core/components/form/SelectTokenField"
import WhenFieldChanges from "app/core/components/WhenFieldChanges"
import { TokenAmountField } from "app/core/components/form/TokenAmountField"
import TextareaField from "app/core/components/form/TextareaField"
import Button from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { useRouter } from "next/router"
import PreviewEditor from "app/core/components/MarkdownPreview"

const InboxRequest: BlitzPage = () => {
  const inboxId = useParam("inboxId", "string") as string
  const setToastState = useStore((state) => state.setToastState)

  const { inbox } = useInbox(inboxId)

  const tokens = getNetworkTokens(inbox?.chainId as number)
  const { resolveEnsAddress } = useResolveEnsAddress()
  const router = useRouter()

  const [createCheckMutation, { isLoading }] = useMutation(createCheck, {
    onSuccess: (check) => {
      console.log("check", check)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Request submitted.",
      })
      router.push(Routes.ViewRequest({ requestId: check.id }))
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  return (
    <div className="w-1/2 mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6">{inbox?.data.name}</h1>
      <PreviewEditor markdown={inbox?.data.notes} />
      <div className="mt-12">
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
              inboxId: inboxId,
              chainId: inbox?.chainId as number,
              address: inbox?.address as string,
              title: values.note,
              to: to,
              value: value.toString(),
              data: data,
              meta: {
                type: CheckType.FungibleTransfer,
                recipient,
                token: values.token,
                amount: values.tokenAmount,
              },
              delegatecall: false,
            })
          }}
          render={({ form, handleSubmit }) => {
            const formState = form.getState()
            return (
              <form onSubmit={handleSubmit}>
                <TextareaField
                  title="Note*"
                  fieldName="note"
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
                <div className="mt-12 mx-auto w-fit">
                  <Button isSubmitType={true} isLoading={isLoading} isDisabled={formState.invalid}>
                    Request
                  </Button>
                </div>
              </form>
            )
          }}
        />
      </div>
    </div>
  )
}

InboxRequest.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="Inbox Request">
      <div className="p-5 md:p-10 w-full max-h-screen overflow-y-auto">{page}</div>
    </Layout>
  )
}

InboxRequest.suppressFirstRenderFlicker = true

export default InboxRequest
