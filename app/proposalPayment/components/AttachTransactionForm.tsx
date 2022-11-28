import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import Button from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { txPathString } from "app/core/utils/constants"
import { getNetworkExplorer } from "app/core/utils/networkInfo"
import saveTransactionHashToPayments from "app/proposal/mutations/saveTransactionToPayments"
import getProposalById from "app/proposal/queries/getProposalById"
import { composeValidators, isValidTransactionLink, requiredField } from "app/utils/validators"
import { Field, Form } from "react-final-form"

export const AttachTransactionForm = ({
  milestone,
  chainId,
  isLoading,
  setIsLoading,
  setIsOpen,
}) => {
  const setToastState = useStore((state) => state.setToastState)

  const [saveTransactionHashToPaymentsMutation] = useMutation(saveTransactionHashToPayments, {
    onSuccess: (_data) => {
      console.log("success", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const saveTransactionHashToPayment = async (transactionHash: string) => {
    try {
      setIsLoading(true)
      // update payment as cashed in db
      await saveTransactionHashToPaymentsMutation({
        proposalId: milestone.proposalId,
        milestoneId: milestone.id,
        transactionHash,
      })

      invalidateQuery(getProposalById)

      setIsOpen(false)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Transaction attachment succeeded.",
      })
      setIsLoading(false)
    } catch (e) {
      console.error("Failed to save transaction hash", e)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: e.message,
      })
      setIsLoading(false)
    }
  }

  return (
    <>
      <h3 className="text-2xl font-bold pt-6">
        Attach a link to the transaction to prove your payment
      </h3>
      <Form
        onSubmit={async (values) => {
          const explorerUrl = getNetworkExplorer(chainId)
          const transactionHash = values.transactionLink.substring(
            explorerUrl.length + txPathString.length
          )
          saveTransactionHashToPayment(transactionHash)
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()

          return (
            <form onSubmit={handleSubmit}>
              <label className="font-bold block mt-12">Proof of payment*</label>
              <Field
                name="transactionLink"
                validate={composeValidators(requiredField, isValidTransactionLink(chainId))}
              >
                {({ meta, input }) => (
                  <>
                    <input
                      {...input}
                      type="text"
                      required
                      placeholder="Paste Etherscan link"
                      className="bg-wet-concrete rounded mt-1 w-full p-2"
                    />

                    {meta.touched && meta.error && (
                      <span className="text-torch-red text-xs">{meta.error}</span>
                    )}
                  </>
                )}
              </Field>
              <div className="mt-16 mb-11 text-right">
                <Button
                  isLoading={isLoading}
                  isDisabled={formState.invalid || isLoading}
                  isSubmitType={true}
                >
                  Attach
                </Button>
              </div>
            </form>
          )
        }}
      />
    </>
  )
}
