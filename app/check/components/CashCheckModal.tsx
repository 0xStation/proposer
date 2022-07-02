import { useMutation, useQuery, useRouter } from "blitz"
import { useSignTypedData, useToken } from "wagmi"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import createCheck from "app/check/mutations/createCheck"
import { zeroAddress } from "app/core/utils/constants"
import decimalToBigNumber from "app/core/utils/decimalToBigNumber"
import { TypedDataTypeDefinition } from "app/types"
import { Check } from "app/check/types"
import { useCashCheck } from "app/contracts/contracts"
import { BlitzPage } from "blitz"
import { useState } from "react"
import Navigation from "app/terminal/components/settings/navigation"
import { Field, Form } from "react-final-form"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import CashCheck from "app/check/mutations/cashCheck"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getPendingChecksByTerminal from "app/check/queries/getPendingChecksByTerminal"
import { CheckApprovalMetadata } from "app/checkApproval/types"
import { checkToContractTypes } from "app/core/utils/checkToContractTypes"
import { Spinner } from "app/core/components/Spinner"

export const CashCheckModal = ({ isOpen, setIsOpen, check }) => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [waitingCreation, setWaitingCreation] = useState<boolean>(false)

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
      console.log(check)

      setWaitingCreation(true)
      const parsedCheck = checkToContractTypes(check)

      console.log("parsed", parsedCheck)

      //   const transaction = await cashCheck({
      //     args: [
      //       parsedCheck.recipient,
      //       parsedCheck.token,
      //       parsedCheck.amount,
      //       parsedCheck.deadline,
      //       parsedCheck.nonce,
      //       parsedCheck.signatures,
      //     ],
      //   })

      //   console.log(transaction.hash)

      await cashCheckMutation({
        checkId: check.id,
        txnHash: "transaction.hash",
        // txnHash: transaction.hash,
      })

      setWaitingCreation(false)
      setIsOpen(false)

      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Congratulations, the funds have been transferred. Time to execute and deliver! ",
      })
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
      </div>
    </Modal>
  )
}

export default CashCheckModal
