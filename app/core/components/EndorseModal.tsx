import Modal from "./Modal"
import { useState, useEffect, useMemo } from "react"
import { useAccount, useBalance, useWaitForTransaction } from "wagmi"
import Slider from "./Slider"
import { Account } from "app/account/types"
import { utils, BigNumberish } from "ethers"
import { Button } from "./Button"
import {
  useDecimals,
  useEndorsementTokenRead,
  useEndorsementTokenWrite,
  useWaitingRoomWrite,
} from "../contracts/contracts"
import { DEFAULT_NUMBER_OF_DECIMALS, TERMINAL, MAX_ALLOWANCE, CONTRACTS } from "../utils/constants"
import useStore from "../hooks/useStore"

const TokenContext = ({ className, issuanceAmount, symbol, context = "" }) => (
  <div className={className}>
    <p className="text-base font-bold">
      {issuanceAmount} {symbol}
    </p>
    {context && <p className="text-base">{context}</p>}
  </div>
)

const EndorseModal = ({
  isEndorseModalOpen,
  setIsEndorseModalOpen,
  setIsSuccessModalOpen,
  selectedUserToEndorse: contributor,
  initiativeLocalId,
}) => {
  const [{ data: accountData }] = useAccount()

  const [endorsementAmount, setEndorsementAmount] = useState<number>(1)
  const [endorsementBudgetPercentage, setEndorsementBudgetPercentage] = useState(0)
  const [allowance, setAllowance] = useState<number>(0)
  const address = useMemo(() => accountData?.address || undefined, [accountData?.address])
  const activeUser: Account | null = useStore((state) => state.activeUser)
  const [endorsementMessage, setEndorsementMessage] = useState<string>("")
  const [error, setError] = useState<boolean>(false)
  const [transactionPending, setTransactionPending] = useState<boolean>(false)
  const [explorerLink, setExplorerLink] = useState<string>()

  const { loading: allowanceApprovalLoading, write: approveAllowance } = useEndorsementTokenWrite({
    methodName: "approve",
  })

  const { loading: endorseLoading, write: endorse } = useWaitingRoomWrite({
    methodName: "endorse",
  })

  const [, wait] = useWaitForTransaction({
    skip: true,
  })

  const { decimals = DEFAULT_NUMBER_OF_DECIMALS } = useDecimals()
  const [{ data: balanceData }] = useBalance({
    addressOrName: address,
    token: TERMINAL.TOKEN_ADDRESS,
    watch: true,
    formatUnits: decimals,
  })

  const tokenBalance = useMemo(
    () => balanceData?.formatted && parseFloat(balanceData?.formatted || "0"),
    [parseFloat(balanceData?.formatted || "")]
  )

  const tokenBalanceIsDefined = typeof tokenBalance === "number"

  const { read: getAllowance } = useEndorsementTokenRead({
    methodName: "allowance",
  })

  const EndorsingStateMessage = ({ children, error }) => {
    const messageColor = error ? "text-torch-red" : "text-marble-white"

    const padding = endorsementMessage ? "" : "p-2"

    return (
      <p className={`${messageColor} text-center text-base mt-1 mb-[-10px] ${padding}`}>
        {children}
      </p>
    )
  }

  const handleSliderChange = (endorsementAmt) => {
    if (tokenBalanceIsDefined) {
      if (endorsementAmt > tokenBalance) {
        setEndorsementBudgetPercentage((endorsementAmt / tokenBalance) * 100)
        setEndorsementMessage(
          "Insufficient RAILⒺ balance. Please wait for the refill and endorse again later."
        )
        setError(true)
      } else {
        setEndorsementBudgetPercentage((endorsementAmt / tokenBalance) * 100)
        setError(false)
      }
    }
    setEndorsementAmount(endorsementAmt)
  }

  const ViewExplorer = explorerLink && (
    <a href={explorerLink} target="_blank" className="text-magic-mint" rel="noreferrer">
      Explorer
    </a>
  )

  const handleEndorseClick = async () => {
    if (tokenBalanceIsDefined && endorsementAmount > tokenBalance) {
      return
    }

    // TODO: allowance max should be the issuance of the user
    if (allowance < 100) {
      const { data: allowanceData, error: allowanceError } = await approveAllowance({
        args: [CONTRACTS.WAITING_ROOM, MAX_ALLOWANCE],
      })

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
        TERMINAL.REFERRAL_GRAPH,
        contributor.address,
        endorsementAmount * Math.pow(10, decimals),
        initiativeLocalId,
      ],
    })

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
    setIsSuccessModalOpen(true)
  }

  useEffect(() => {
    // since we're reading tokenBalance from on-chain, we need to check
    // first if tokenBalance is defined before we can show any messaging
    if (
      typeof tokenBalance === "number" &&
      endorsementBudgetPercentage &&
      endorsementAmount < tokenBalance
    ) {
      setEndorsementMessage(
        `You're giving ${contributor?.data?.handle} ${endorsementBudgetPercentage.toFixed(
          2
        )}% of your balance`
      )
    }
  }, [tokenBalance, endorsementBudgetPercentage])

  useEffect(() => {
    if (allowanceApprovalLoading || endorseLoading) {
      setError(false)
      setEndorsementMessage("Please check your wallet to complete the endorsement")
    }
  }, [allowanceApprovalLoading, endorseLoading])

  useEffect(() => {
    const getEndorsementTokenAllowance = async () => {
      const { data: tokenAllowance, error } = await getAllowance({
        args: [address, CONTRACTS.WAITING_ROOM],
      })
      setAllowance(parseFloat(utils.formatUnits((tokenAllowance as BigNumberish) || 0, decimals)))
    }
    getEndorsementTokenAllowance()
  }, [decimals, address])

  return (
    <Modal
      title="Endorse"
      open={isEndorseModalOpen}
      toggle={(close) => {
        setError(false)
        setEndorsementMessage("")
        setIsEndorseModalOpen(close)
        setEndorsementBudgetPercentage(0)
      }}
      error={error}
    >
      <div className="mt-20 px-[24px]">
        <div className="flex justify-center">
          <Slider
            onChange={handleSliderChange}
            contributor={contributor}
            disabled={allowanceApprovalLoading || endorseLoading || transactionPending}
          />
        </div>
        <div className="flex flex-row">
          <TokenContext
            className="text-concrete mr-auto text-center w-[115px] ml-[-2%] pt-[.9rem] pl-[.4rem]"
            issuanceAmount={1}
            symbol={"RAILⒺ"}
            context="Like what I've seen so far"
          />
          <TokenContext
            className="text-concrete text-center w-[100px] pt-[.9rem] pl-[1.1rem]"
            issuanceAmount={50}
            symbol={"RAILⒺ"}
          />
          <TokenContext
            className="text-concrete ml-auto text-center w-[115px] pt-[.9rem] pl-[2.2rem]"
            issuanceAmount={100}
            symbol={"RAILⒺ"}
            context="Crazy not to bring them onboard"
          />
        </div>
        <Button
          onClick={handleEndorseClick}
          className="w-1/2 p-1"
          loading={allowanceApprovalLoading || endorseLoading || transactionPending}
          disabled={allowanceApprovalLoading || endorseLoading || transactionPending}
        >
          Endorse
        </Button>
        <EndorsingStateMessage error={error}>
          {endorsementMessage}
          {ViewExplorer}
        </EndorsingStateMessage>
      </div>
    </Modal>
  )
}

export default EndorseModal
