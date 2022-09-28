import { invalidateQuery, useMutation } from "blitz"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import truncateString from "app/core/utils/truncateString"
import Button from "app/core/components/sds/buttons/Button"
import { useNetwork, useWaitForTransaction } from "wagmi"
import { useEffect, useState } from "react"
import { ProposalStatus } from "@prisma/client"
import { useSendTransaction } from "wagmi"
import { Field, Form } from "react-final-form"
import saveTransactionHashToPayments from "../mutations/saveTransactionToPayments"
import getProposalById from "../queries/getProposalById"
import { preparePaymentTransaction } from "app/transaction/payments"
import { composeValidators, isValidTransactionLink, requiredField } from "app/utils/validators"
import { getNetworkExplorer } from "app/core/utils/networkInfo"
import { txPathString } from "app/core/utils/constants"
import SwitchNetworkView from "app/core/components/SwitchNetworkView"
import updateProposalStatus from "app/proposal/mutations/updateProposalStatus"
import { formatCurrencyAmount } from "app/core/utils/formatCurrencyAmount"
import { ProposalPayment } from "app/proposalPayment/types"
import { genProposalPaymentDigest } from "../../signatures/proposalPayment"
import useSignature from "app/core/hooks/useSignature"

enum Tab {
  DIRECT_PAYMENT = "DIRECT_PAYMENT",
  ATTACH_TRANSACTION = "ATTACH_TRANSACTION",
}

export const ExecutePaymentModal = ({ isOpen, setIsOpen, milestone }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.DIRECT_PAYMENT)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [txnHash, setTxnHash] = useState<string>()
  const [transactionPayload, setTransactionPayload] = useState<any>()
  const [saveTransactionHashToPaymentsMutation] = useMutation(saveTransactionHashToPayments, {
    onSuccess: (_data) => {
      console.log("success", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })
  const { signMessage } = useSignature()

  const [updateProposalStatusMutation] = useMutation(updateProposalStatus)

  const { chain: activeChain } = useNetwork()
  const { sendTransactionAsync } = useSendTransaction({ mode: "recklesslyUnprepared" })

  // for now, only one payment per milestone
  // once we support splits, this logic will need to support multiple payments and bundle execution to multicall contract
  const payment = milestone?.payments[0]

  useEffect(() => {
    if (payment) {
      const payload = preparePaymentTransaction(
        payment?.recipientAddress,
        payment?.data?.token,
        payment?.amount
      )
      setTransactionPayload(payload)
    }
  }, [payment])

  useWaitForTransaction({
    confirmations: 1,
    hash: txnHash as string,
    onSuccess: async (data) => {
      try {
        invalidateQuery(getProposalById)

        // once the payment tx is cleared
        // move the proposal status to complete
        // todo: task queue to properly address payment txs
        await updateProposalStatusMutation({
          proposalId: payment.proposalId,
          status: ProposalStatus.COMPLETE,
        })

        setIsOpen(false)
        setToastState({
          isToastShowing: true,
          type: "success",
          message: "Payment execution succeeded.",
        })
        setIsLoading(false)
      } catch (e) {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Payment execution failed.",
        })
      }
    },
    onError: async (data) => {
      setIsLoading(false)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Payment execution failed.",
      })
      console.error(data)
    },
  })

  const saveTransactionHashToPayment = async (transactionHash: string) => {
    setIsLoading(true)
    // update payment as cashed in db
    const updatedPayments = await saveTransactionHashToPaymentsMutation({
      proposalId: milestone.proposalId,
      milestoneId: milestone.id,
      transactionHash,
    })

    const message = genProposalPaymentDigest(updatedPayments[0] as ProposalPayment)
    const signature = await signMessage(message)

    if (!signature) {
      throw Error("Unsuccessful signature.")
    }

    await updateProposalStatusMutation({
      proposalId: payment.proposalId,
      status: ProposalStatus.COMPLETE,
    })

    invalidateQuery(getProposalById)

    setIsOpen(false)
    setToastState({
      isToastShowing: true,
      type: "success",
      message: "Transaction attachment succeeded.",
    })
    setIsLoading(false)
  }

  const initiatePayment = async () => {
    try {
      setIsLoading(true)

      const transaction = await sendTransactionAsync({
        recklesslySetUnpreparedRequest: {
          ...transactionPayload,
        },
      })

      // update payment as cashed in db
      const updatedPayment = await saveTransactionHashToPaymentsMutation({
        proposalId: milestone.proposalId,
        milestoneId: milestone.id,
        transactionHash: transaction.hash,
      })

      // the `txnHash` state is required to enable the useWaitForTransaction hook in the parent page
      // useWaitForTransaction is a wagmi hook that waits for a given transaction to confirm on the blockchain
      // on successful processing of our transaction, we show a toast and update the check's status on UI
      setTxnHash(transaction.hash)
    } catch (e) {
      setIsLoading(false)
      console.error(e)
      let message = "Something went wrong."
      if (e.name == "ConnectorNotFoundError") {
        message = "Please reset wallet connection.\n(ConnectorNotFoundError)"
      } else if (e.message.includes("insufficient funds")) {
        // don't have enough ETH to pay
        message = "Insufficient wallet balance for payment."
      } else if (e.message.includes("ERC20: transfer amount exceeds balance")) {
        // don't have enough ERC20 to pay
        message = "Insufficient wallet balance for payment."
      }
      setToastState({
        isToastShowing: true,
        type: "error",
        message,
      })
      return false
    }
  }

  const DirectPaymentTab = () => {
    return (
      <>
        <h3 className="text-2xl font-bold pt-6">
          Next, pay the Contributor for their contribution
        </h3>
        <table className="mt-8">
          <tr>
            <th className="w-36"></th>
            <th></th>
          </tr>
          <tbody>
            <tr className="h-12">
              <td className="text-concrete">Pay to</td>
              {/* TODO: ENS wrap this */}
              <td>{truncateString(payment?.recipientAddress)}</td>
            </tr>
            <tr className="h-12">
              <td className="text-concrete">Token</td>
              <td>{payment?.data?.token.symbol}</td>
            </tr>
            <tr className="h-12">
              <td className="text-concrete">Amount</td>
              <td>{formatCurrencyAmount(payment?.amount.toString())}</td>
            </tr>
          </tbody>
        </table>
        <Button
          className="mt-8"
          isLoading={isLoading}
          isDisabled={isLoading}
          onClick={() => initiatePayment()}
        >
          Pay
        </Button>
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

  const AttachTransactionTab = ({ chainId }) => {
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
            await saveTransactionHashToPayment(transactionHash)
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
                <div className="mt-16 mb-11">
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
        {!activeChain || activeChain.id !== payment?.data?.token.chainId ? (
          <SwitchNetworkView
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            chainId={payment?.data?.token.chainId}
          />
        ) : (
          <>
            <div className="space-x-4 text-l mt-4">
              <span
                className={`${
                  selectedTab === Tab.DIRECT_PAYMENT && "border-b mb-[-1px] font-bold"
                } cursor-pointer`}
                onClick={() => setSelectedTab(Tab.DIRECT_PAYMENT)}
              >
                Direct payment
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
            {selectedTab === Tab.DIRECT_PAYMENT ? (
              <DirectPaymentTab />
            ) : (
              <AttachTransactionTab chainId={payment?.data?.token.chainId} />
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

export default ExecutePaymentModal
