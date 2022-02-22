import Modal from "./Modal"
import { useState, useEffect, useMemo } from "react"
import { useAccount, useBalance, useWaitForTransaction } from "wagmi"
import { utils, BigNumberish } from "ethers"
import { Button } from "./Button"
import {
  useDecimals,
  useEndorsementTokenRead,
  useEndorsementTokenWrite,
  useWaitingRoomWrite,
} from "../contracts/contracts"
import { DEFAULT_NUMBER_OF_DECIMALS, TERMINAL, MAX_ALLOWANCE, CONTRACTS } from "../utils/constants"

const EndorseModal = ({
  isEndorseModalOpen,
  setIsEndorseModalOpen,
  setIsSuccessModalOpen,
  selectedUserToEndorse: contributor,
  initiativeLocalId,
  terminal,
}) => {
  const [{ data: accountData }] = useAccount()
  const [endorsementAmount, setEndorsementAmount] = useState<number>(1)
  const [allowance, setAllowance] = useState<number>(0)
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const [endorsementMessage, setEndorsementMessage] = useState<string>("")
  const [error, setError] = useState<boolean>(false)
  const [invalidInput, setInvalidInput] = useState<boolean>(false)
  const [transactionPending, setTransactionPending] = useState<boolean>(false)
  const [explorerLink, setExplorerLink] = useState<string>()

  const { loading: allowanceApprovalLoading, write: approveAllowance } = useEndorsementTokenWrite({
    methodName: "approve",
    contract: terminal.data?.contracts.addresses.endorsements,
  })

  const { loading: endorseLoading, write: endorse } = useWaitingRoomWrite({
    methodName: "endorse",
  })

  const [, wait] = useWaitForTransaction({
    skip: true,
  })

  const endorsementsSymbol = terminal.data?.contracts?.symbols.endorsements

  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals(
    terminal.data?.contracts.addresses.endorsements
  )
  const [{ data: balanceData }] = useBalance({
    addressOrName: address,
    token: terminal.data?.contracts?.addresses?.endorsements,
    watch: true,
    formatUnits: decimals,
  })

  const tokenBalance = useMemo(
    () => balanceData?.formatted && parseFloat(balanceData?.formatted || "0"),
    [parseFloat(balanceData?.formatted || "0")]
  )

  const tokenBalanceIsDefined = typeof tokenBalance === "number"

  const { read: getAllowance } = useEndorsementTokenRead({
    methodName: "allowance",
    contract: terminal.data?.contracts.addresses.endorsements,
  })

  const validateAmountAndShowFeedback = (endorsementAmt) => {
    if (tokenBalanceIsDefined) {
      if (endorsementAmount <= tokenBalance && endorsementAmount > 0) {
        setEndorsementMessage(
          `You're endorsing ${endorsementAmount} of your ${tokenBalance} ${endorsementsSymbol}.`
        )
      } else if (isNaN(endorsementAmt)) {
        setEndorsementMessage("Please enter a valid amount.")
        setInvalidInput(true)
      } else if (endorsementAmt > tokenBalance) {
        setEndorsementMessage(
          `Amount exceeds your balance of ${tokenBalance} ${endorsementsSymbol}.`
        )
        setInvalidInput(true)
      } else if (endorsementAmt <= 0) {
        setEndorsementMessage(`Please enter an amount greater than 0.`)
        setInvalidInput(true)
      } else {
        setInvalidInput(false)
        setError(false)
      }
    }
  }

  const handleEndorsementAmountChange = (event) => {
    // `event.target.validity.valid` is valid if numbers and/or decimal followed by "0" is entered
    const endorsementAmt = event.target.validity.valid
      ? parseInt(event.target.value)
      : endorsementAmount

    setEndorsementAmount(endorsementAmt)

    validateAmountAndShowFeedback(endorsementAmt)
  }

  const ViewExplorer = explorerLink && (
    <>
      <a href={explorerLink} target="_blank" className="text-magic-mint" rel="noreferrer">
        Explorer
      </a>
      .
    </>
  )

  const handleEndorseClick = async () => {
    if (tokenBalanceIsDefined && endorsementAmount > tokenBalance && endorsementAmount < 0) {
      return
    }

    // TODO: allowance max should be the issuance of the user
    if (allowance < 100) {
      const { data: allowanceData, error: allowanceError } = await approveAllowance({
        args: [CONTRACTS.WAITING_ROOM, MAX_ALLOWANCE],
      })

      // poll for on-chain allowance data until we have an error or the results data
      let allowanceTransaction
      while (!allowanceTransaction?.data && !allowanceError) {
        setTransactionPending(true)
        setEndorsementMessage("Allowance is pending. This might take a minute.")
        allowanceTransaction = await wait({
          hash: allowanceData?.hash,
        })
      }

      if (allowanceError) {
        setError(true)
        setTransactionPending(false)
        setEndorsementMessage("Allowance didn't go through. Please try again.")
        return
      }
    }

    const { data: endorseData, error: endorseError } = await endorse({
      args: [
        terminal.data?.contracts?.addresses.referrals,
        contributor.address,
        endorsementAmount * Math.pow(10, decimals),
        initiativeLocalId,
      ],
    })

    // poll for on-chain endorse data until we have an error or the results data
    let endorseTransaction
    while (!endorseTransaction?.data && !endorseError) {
      setTransactionPending(true)
      let endorsePendingMsg
      if (endorseData?.hash) {
        endorsePendingMsg = "Endorsement is pending. View the status on "
        setExplorerLink(`https://rinkeby.etherscan.io/tx/${endorseData?.hash}`)
      } else {
        endorsePendingMsg = "Endorsement is pending. Hang tight."
      }
      setEndorsementMessage(endorsePendingMsg)
      endorseTransaction = await wait({
        hash: endorseData?.hash,
      })
    }

    if (endorseError) {
      setError(true)
      setTransactionPending(false)
      setEndorsementMessage("Endorsement didn't go through. Please try again.")
      return
    }

    setTransactionPending(false)
    setEndorsementMessage("")
    setExplorerLink("")
    setIsEndorseModalOpen(false)
    // allow time for applicant modal to clean up
    // before opening the next modal and causing
    // a memory leak + scroll lock
    // see https://github.com/tailwindlabs/headlessui/issues/825
    setTimeout(() => setIsSuccessModalOpen(true), 550)
  }

  // hook to show endorsement message of how much a user is endorsing.
  useEffect(() => {
    validateAmountAndShowFeedback(endorsementAmount)
  }, [tokenBalance, endorsementAmount])

  useEffect(() => {
    if (allowanceApprovalLoading || endorseLoading) {
      setError(false)
      setEndorsementMessage("Please check your wallet to complete the endorsement.")
    }
  }, [allowanceApprovalLoading, endorseLoading])

  useEffect(() => {
    const getEndorsementTokenAllowance = async () => {
      const { data: tokenAllowance } = await getAllowance({
        args: [address, CONTRACTS.WAITING_ROOM],
      })
      setAllowance(parseFloat(utils.formatUnits((tokenAllowance as BigNumberish) || 0, decimals)))
    }
    getEndorsementTokenAllowance()
  }, [decimals, address])

  return (
    <Modal
      title="Endorse"
      subtitle={`Signal your magnitude of support for ${contributor?.data?.name}.`}
      open={isEndorseModalOpen}
      toggle={(close) => {
        setInvalidInput(false)
        setError(false)
        setEndorsementMessage("")
        setIsEndorseModalOpen(close)
      }}
      error={error || invalidInput}
    >
      <div className="mt-6 px-[24px] flex-col items-center">
        <input
          className="mx-auto mb-6 block bg-tunnel-black text-marble-white w-24 h-fit text-center text-5xl"
          placeholder="1"
          onChange={handleEndorsementAmountChange}
          // input gives a warning if the value results to NaN, but does not
          // when the value results to an empty string.
          value={isNaN(endorsementAmount) ? "" : Math.floor(endorsementAmount)}
          max="100"
          min="0"
          type="number"
          pattern="[0-9]*"
          onBlur={(e) => {
            // remove decimals on blur
            e.target.value = parseInt(e.target.value).toString()
          }}
        ></input>
        <Button
          type="submit"
          onClick={handleEndorseClick}
          className="w-1/2 p-1"
          loading={allowanceApprovalLoading || endorseLoading || transactionPending}
          disabled={
            invalidInput || allowanceApprovalLoading || endorseLoading || transactionPending
          }
        >
          Endorse
        </Button>
        <p
          className={`${
            error || invalidInput ? "text-torch-red" : "text-marble-white"
          } text-center text-base mt-1 mb-[-10px] p-2`}
        >
          {endorsementMessage}
          {ViewExplorer}
        </p>
      </div>
    </Modal>
  )
}

export default EndorseModal
