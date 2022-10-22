import { useMutation, invalidateQuery } from "@blitzjs/rpc"
import { useState } from "react"
import Modal from "app/core/components/Modal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useGnosisSignature from "app/core/hooks/useGnosisSignature"
import updatePayment from "app/proposalPayment/mutations/updatePayment"
import useStore from "app/core/hooks/useStore"
import { Field, Form } from "react-final-form"
import { composeValidators, isValidTransactionLink, requiredField } from "app/utils/validators"
import { getNetworkExplorer } from "app/core/utils/networkInfo"
import { txPathString } from "app/core/utils/constants"
import saveTransactionHashToPayments from "app/proposal/mutations/saveTransactionToPayments"
import getMilestonesByProposal from "app/proposalMilestone/queries/getMilestonesByProposal"

enum Tab {
  QUEUE_PAYMENT = "QUEUE_PAYMENT",
  ATTACH_TRANSACTION = "ATTACH_TRANSACTION",
}

export const QueueGnosisTransactionModal = ({ isOpen, setIsOpen, milestone }) => {
  const setToastState = useStore((state) => state.setToastState)
  const activePayment = milestone.payments[0]

  const { signMessage: signGnosis } = useGnosisSignature(activePayment)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.QUEUE_PAYMENT)

  const [updatePaymentMutation] = useMutation(updatePayment, {
    onSuccess: (data) => {},
    onError: (error) => {
      console.error(error)
    },
  })

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

      invalidateQuery(getMilestonesByProposal)

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

  const QueuePaymentTab = () => {
    return (
      <>
        <h3 className="text-2xl font-bold mt-4">Queue transaction</h3>
        <p className="mt-2">
          Sign to queue this transaction on Gnosis. Afterwards, you and other signers will be able
          to view and execute this transaction on the Gnosis app.
        </p>
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
          <Button
            isSubmitType={true}
            isLoading={isLoading}
            isDisabled={false}
            onClick={async () => {
              setIsLoading(true)
              try {
                const response = await signGnosis()
                if (!response) {
                  setIsLoading(false)
                  throw new Error("Signature Failed")
                }
                const s = await updatePaymentMutation({
                  multisigTransaction: {
                    transactionId: response.txId,
                    safeTxHash: response.detailedExecutionInfo.safeTxHash,
                    address: response.safeAddress,
                  },
                  paymentId: activePayment.id,
                })
                console.log(s)
                invalidateQuery(getMilestonesByProposal)
                setIsLoading(false)
                setIsOpen(false)
              } catch (e) {
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: "Signature failed.",
                })
                console.error(e)
              }
            }}
          >
            Sign
          </Button>
        </div>
        <p className="text-xs mt-2">You’ll be redirected to a transaction page to confirm.</p>
        <p className="text-xs">
          Already paid?{" "}
          <button
            onClick={() => {
              setSelectedTab(Tab.ATTACH_TRANSACTION)
            }}
          >
            <span className="text-electric-violet">Paste a transaction link</span>
          </button>
          .
        </p>
      </>
    )
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
      <div className="p-2">
        <div className="space-x-4 text-l mt-4">
          <span
            className={`${
              selectedTab === Tab.QUEUE_PAYMENT && "border-b mb-[-1px] font-bold"
            } cursor-pointer`}
            onClick={() => setSelectedTab(Tab.QUEUE_PAYMENT)}
          >
            Queue payment
          </span>
          <span
            className={`${
              selectedTab === Tab.ATTACH_TRANSACTION && "border-b mb-[-1px] font-bold"
            } cursor-pointer`}
            onClick={() => setSelectedTab(Tab.ATTACH_TRANSACTION)}
          >
            Attach transaction
          </span>
        </div>
        {selectedTab === Tab.QUEUE_PAYMENT && <QueuePaymentTab />}
        {selectedTab === Tab.ATTACH_TRANSACTION && <AttachPaymentTab />}
      </div>
    </Modal>
  )
}

export default QueueGnosisTransactionModal
