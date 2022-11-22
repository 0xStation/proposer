import { useMutation, invalidateQuery } from "@blitzjs/rpc"
import { useState } from "react"
import Modal from "app/core/components/Modal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { Field, Form } from "react-final-form"
import { composeValidators, isValidTransactionLink, requiredField } from "app/utils/validators"
import { getNetworkExplorer } from "app/core/utils/networkInfo"
import getProposalById from "app/proposal/queries/getProposalById"
import { txPathString } from "app/core/utils/constants"
import saveTransactionHashToPayments from "app/proposal/mutations/saveTransactionToPayments"

export const AttachTransactionModal = ({ isOpen, setIsOpen, milestone }) => {
  const setToastState = useStore((state) => state.setToastState)
  // TODO: not sure we can claim activePayment is 0th index anymore
  // now that we can queue multiple payments if one is rejected... reassess
  const activePayment = milestone.payments[0]
  const [isLoading, setIsLoading] = useState<boolean>(false)

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
        paymentId: activePayment.id,
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

  const AttachPaymentTab = () => {
    const chainId = activePayment.data.token.chainId
    return (
      <>
        <h3 className="text-2xl font-bold mt-4">Attach transaction</h3>
        <p className="mt-2">Attach a link to the transaction to prove your payment.</p>
        <Form
          onSubmit={async (values) => {
            const explorerUrl = getNetworkExplorer(chainId)
            const transactionHash = values.transactionLink.substring(
              explorerUrl.length + txPathString.length
            )
            saveTransactionHashToPayment(transactionHash)
          }}
          render={({ handleSubmit }) => {
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
                <div className="mt-8 flex items-center">
                  <Button
                    className="mr-2"
                    type={ButtonType.Secondary}
                    onClick={() => {
                      setIsLoading(false)
                      setIsOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button isLoading={isLoading} isDisabled={isLoading} isSubmitType={true}>
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

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <AttachPaymentTab />
    </Modal>
  )
}

export default AttachTransactionModal
