import { useMutation, useRouter } from "blitz"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import { useCashCheck } from "app/contracts/contracts"
import CashCheck from "app/check/mutations/cashCheck"
import { checkToContractTypes } from "app/core/utils/checkToContractTypes"
import { Spinner } from "app/core/components/Spinner"
import truncateString from "app/core/utils/truncateString"
import { formatDate } from "app/core/utils/formatDate"
import { useWaitForTransaction } from "wagmi"

export const CashCheckModal = ({
  isOpen,
  setIsOpen,
  waitingCreation,
  setWaitingCreation,
  setTxnHash,
  setToastState,
  check,
}) => {
  const [cashCheckMutation] = useMutation(CashCheck, {
    onSuccess: (_data) => {
      console.log("success", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const { cashCheck } = useCashCheck(check.fundingAddress as string)

  const executeCashCheck = async () => {
    try {
      setWaitingCreation(true)
      const parsedCheck = checkToContractTypes(check)

      const transaction = await cashCheck({
        args: [
          parsedCheck.recipient,
          parsedCheck.token,
          parsedCheck.amount,
          parsedCheck.deadline,
          parsedCheck.nonce,
          parsedCheck.signatures,
        ],
      })

      await cashCheckMutation({
        checkId: check.id,
        txnHash: transaction.hash,
      })

      // triggers hook for useWaitForTransaction which waits to show toast and update check status on UI
      setTxnHash(transaction.hash)
    } catch (e) {
      setWaitingCreation(false)
      console.error(e)
      if (e.name == "ConnectorNotFoundError") {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Please reset wallet connection.\n(ConnectorNotFoundError)",
        })
      } else if (e.message.includes("execution reverted: nonce used")) {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "This check has already been cashed.",
        })
      } else {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Contract creation failed.",
        })
      }
      return false
    }
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Cash check</h3>
        <div className="mt-8">
          <div className="flex justify-between items-center mt-2">
            <span className="text-small font-bold">Fund recipient</span>
            <span className="text-small">{truncateString(check.recipientAddress)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-small font-bold">Proposal ID</span>
            <span className="text-small">{truncateString(check.proposalId)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-small font-bold">Token</span>
            {/* TODO: change to token symbol once we copy that data through models */}
            <span className="text-small">{truncateString(check.tokenAddress)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-small font-bold">Amount</span>
            <span className="text-small">{check.tokenAmount}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-small font-bold">Cashing date</span>
            <span className="text-small">{formatDate(new Date())}</span>
          </div>
        </div>
        <button
          type="submit"
          className="rounded text-tunnel-black text-bold px-8 py-2 w-28 h-10 mt-12 
                        bg-electric-violet"
          disabled={waitingCreation}
          onClick={() => {
            executeCashCheck()
          }}
        >
          {waitingCreation ? (
            <div className="flex justify-center items-center">
              <Spinner fill="black" />
            </div>
          ) : (
            "Cash"
          )}
        </button>
      </div>
    </Modal>
  )
}

export default CashCheckModal
