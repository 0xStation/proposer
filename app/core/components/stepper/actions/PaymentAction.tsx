import { useEffect, useState } from "react"
import { AddressType } from "@prisma/client"
import { ArrowRightIcon } from "@heroicons/react/solid"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { getNetworkGnosisUrl } from "app/core/utils/networkInfo"
import { useStepperStore } from "../StepperRenderer"
import { ProposalPayment, ProposalPaymentStatus } from "app/proposalPayment/types"
import { useSafeTxStatus } from "app/core/hooks/useSafeTxStatus"
import TextLink from "../../TextLink"
import { getMostRecentPaymentAttempt } from "app/proposalPayment/utils"
import { useSafeMetadata } from "app/core/hooks/useSafeMetadata"

const PaymentAction = ({ proposal, milestone, payment, isWithinStepper = true }) => {
  const mostRecentPaymentAttempt = getMostRecentPaymentAttempt(payment)
  const [quorumMet, setQuorumMet] = useState<boolean>(false)
  const [nonceBlocked, setNonceBlocked] = useState<boolean>(false)
  const [userHasSignedGnosisTx, setUserHasSignedGnosisTx] = useState<boolean>(false)
  const activeUser = useStore((state) => state.activeUser)
  const toggleExecutePaymentModalMap = useStore((state) => state.toggleExecutePaymentModalMap)
  const toggleQueueGnosisTransactionModalMap = useStore(
    (state) => state.toggleQueueGnosisTransactionModalMap
  )
  const toggleApproveGnosisTransactionModalMap = useStore(
    (state) => state.toggleApproveGnosisTransactionModalMap
  )

  const payerAddress = payment.senderAddress
  const chainId = payment?.data.token.chainId || 1

  const safeMetadata = useSafeMetadata(payerAddress, AddressType.SAFE, chainId)
  const { confirmations } = useSafeTxStatus(proposal, milestone, payment)

  const userIsPayer = addressesAreEqual(payerAddress, activeUser?.address)
  const userIsSigner =
    safeMetadata?.signers?.some((signer) => addressesAreEqual(signer, activeUser?.address)) || false

  useEffect(() => {
    if (userIsSigner && confirmations) {
      const userHasSignedGnosisSafeTx = confirmations.some((confirmation) =>
        addressesAreEqual(confirmation.owner, activeUser?.address)
      )
      setUserHasSignedGnosisTx(userHasSignedGnosisSafeTx)
      if (confirmations.length >= safeMetadata?.quorum) {
        setQuorumMet(true)
      }
    }
  }, [userIsSigner, confirmations])

  useEffect(() => {
    if (
      mostRecentPaymentAttempt &&
      safeMetadata &&
      mostRecentPaymentAttempt.multisigTransaction?.nonce > safeMetadata?.nonce
    ) {
      setNonceBlocked(true)
    }
  }, [payment, safeMetadata])

  const paymentComplete = mostRecentPaymentAttempt
    ? mostRecentPaymentAttempt.status !== ProposalPaymentStatus.QUEUED
    : false

  const currentMilestoneId = proposal?.milestones?.find(
    (milestone) => milestone.index === proposal?.currentMilestoneIndex
  )?.id
  const paymentIsActive = payment?.milestoneId === currentMilestoneId

  return (
    <>
      {!payment || !paymentIsActive || (!userIsSigner && !userIsPayer) ? (
        <></>
      ) : userIsPayer && !paymentComplete ? (
        <Button
          type={isWithinStepper ? ButtonType.Secondary : ButtonType.Primary}
          isDisabled={!paymentIsActive}
          onClick={() => toggleExecutePaymentModalMap({ open: true, id: payment.id })}
          overrideWidthClassName="w-full"
        >
          Pay
        </Button>
      ) : // user is signer on the gnosis safe
      // and there is not a payment attempt
      userIsSigner && !mostRecentPaymentAttempt ? (
        <Button
          type={isWithinStepper ? ButtonType.Secondary : ButtonType.Primary}
          isDisabled={!paymentIsActive}
          onClick={() => toggleQueueGnosisTransactionModalMap({ open: true, id: payment.id })}
          overrideWidthClassName="w-full"
        >
          Queue and approve
          <ArrowRightIcon className="h-4 w-4 inline mb-1 ml-2 rotate-[315deg]" />
        </Button>
      ) : // user is signer on the gnosis safe
      // and there IS a payment attempt, meaning it has been queued
      // and the user has not yet signed the gnosis tx
      userIsSigner &&
        !!mostRecentPaymentAttempt &&
        mostRecentPaymentAttempt.status === ProposalPaymentStatus.QUEUED &&
        !userHasSignedGnosisTx &&
        !quorumMet ? (
        <Button
          type={isWithinStepper ? ButtonType.Secondary : ButtonType.Primary}
          isDisabled={!paymentIsActive}
          onClick={() => toggleApproveGnosisTransactionModalMap({ open: true, id: payment.id })}
          overrideWidthClassName="w-full px-4"
        >
          Approve transaction
        </Button>
      ) : // user is signer on the gnosis safe
      // and there is a payment attempt, meaning it has been queued
      // and the user has signed the gnosis tx
      // and quorum has not yet been met
      userIsSigner && !!mostRecentPaymentAttempt && !!userHasSignedGnosisTx && !quorumMet ? (
        <Button
          type={ButtonType.Unemphasized}
          isDisabled={true}
          overrideWidthClassName="w-full px-4"
        >
          You have approved
        </Button>
      ) : // user is signer on the gnosis safe
      // and there IS mutliSigTransaction data on the payment, meaning it has been queued
      // and the quorum is met

      userIsSigner &&
        !!mostRecentPaymentAttempt &&
        mostRecentPaymentAttempt.status === ProposalPaymentStatus.QUEUED &&
        !!quorumMet ? (
        <>
          <Button
            type={isWithinStepper ? ButtonType.Secondary : ButtonType.Primary}
            isDisabled={!paymentIsActive || nonceBlocked}
            onClick={() =>
              toggleExecutePaymentModalMap({
                open: true,
                id: payment.id,
              })
            }
            overrideWidthClassName="w-full"
          >
            Pay
          </Button>
          {nonceBlocked && (
            <span className="w-full text-xs text-concrete">
              This transaction is blocked by other pending transactions.{" "}
              <TextLink
                url={`${getNetworkGnosisUrl(payment.data.token.chainId)}:${
                  payment.senderAddress
                }/transactions/queue`}
              >
                Execute them on Gnosis
              </TextLink>{" "}
              to continue.
            </span>
          )}
        </>
      ) : // user is signer on the gnosis safe
      // and there IS mutliSigTransaction data on the payment, meaning it has been queued
      userIsSigner &&
        !!mostRecentPaymentAttempt &&
        (mostRecentPaymentAttempt.status === ProposalPaymentStatus.REJECTED ||
          mostRecentPaymentAttempt.status === ProposalPaymentStatus.FAILED) ? (
        <Button
          type={isWithinStepper ? ButtonType.Secondary : ButtonType.Primary}
          isDisabled={!paymentIsActive}
          onClick={() => toggleQueueGnosisTransactionModalMap({ open: true, id: payment.id })}
          overrideWidthClassName="w-full"
        >
          Re-queue transaction
          <ArrowRightIcon className="h-4 w-4 inline mb-1 ml-2 rotate-[315deg]" />
        </Button>
      ) : (
        <></>
      )}
    </>
  )
}

export default PaymentAction
