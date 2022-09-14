import { invalidateQuery, useMutation } from "blitz"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import truncateString from "app/core/utils/truncateString"
import { formatDate } from "app/core/utils/formatDate"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { getNetworkName } from "app/core/utils/getNetworkName"
import { useNetwork, useSwitchNetwork, useWaitForTransaction } from "wagmi"
import { useEffect, useState } from "react"
import saveTransactionHashToPayments from "../mutations/saveTransactionToPayments"
import getProposalNewById from "../queries/getProposalNewById"
import { preparePaymentTransaction } from "app/transaction/payments"
import { useSendTransaction } from "wagmi"
import { Field, Form } from "react-final-form"
import { composeValidators, isValidTransactionLink, requiredField } from "app/utils/validators"
import { getNetworkExplorer } from "app/core/utils/networks/getNetworkExplorer"

enum Tab {
  DIRECT_PAYMENT = "DIRECT_PAYMENT",
  ATTACH_TRANSACTION = "ATTACH_TRANSACTION",
}

export const ExecutePaymentModal = ({ isOpen, setIsOpen, isLoading, setIsLoading, payment }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.DIRECT_PAYMENT)
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

  const { chain: activeChain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { sendTransactionAsync } = useSendTransaction({ mode: "recklesslyUnprepared" })

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
        invalidateQuery(getProposalNewById)

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
    await saveTransactionHashToPaymentsMutation({
      transactionHash,
      paymentIds: [payment.id],
    })

    invalidateQuery(getProposalNewById)

    setIsOpen(false)
    setToastState({
      isToastShowing: true,
      type: "success",
      message: "Trasaction attachment succeeded.",
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
      await saveTransactionHashToPaymentsMutation({
        transactionHash: transaction.hash,
        paymentIds: [payment.id],
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

  const SwitchNetworkView = () => {
    return (
      <div>
        <h3 className="text-2xl font-bold pt-6">Change network to approve</h3>
        <p className="mt-2">
          You are connected to the wrong network! Click below to switch networks.
        </p>
        <div className="mt-8">
          <button
            type="button"
            className="text-electric-violet border border-electric-violet mr-2 py-1 w-[98px] rounded hover:opacity-75"
            onClick={() => {
              setIsOpen(false)
              setIsLoading(false)
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 w-[98px] rounded hover:opacity-75"
            onClick={() => {
              switchNetwork?.(payment.data?.token.chainId)
            }}
          >
            Switch
          </button>
        </div>
      </div>
    )
  }

  const DirectPaymentTab = () => {
    return (
      <>
        <h3 className="text-2xl font-bold pt-6">
          Next, pay the Contributor for their contribution
        </h3>
        <table className="mt-8">
          <thead>
            <tr>
              <th className="w-36"></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-12">
              <td className="text-concrete">Pay to</td>
              <td>{truncateString(payment?.recipientAddress)}</td>
            </tr>
            <tr className="h-12">
              <td className="text-concrete">Token</td>
              <td>{payment?.data?.token.symbol}</td>
            </tr>
            <tr className="h-12">
              <td className="text-concrete">Amount</td>
              <td>{payment?.amount}</td>
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
            const txPathString = "/tx/"
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
          <SwitchNetworkView />
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
