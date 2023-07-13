import { useEffect, useState } from "react"
import { ProposalRoleType, AddressType } from "@prisma/client"
import { ArrowRightIcon } from "@heroicons/react/solid"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import useGetUsersRoles from "app/core/hooks/useGetUsersRoles"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { getNetworkGnosisUrl } from "app/core/utils/networkInfo"
import { useStepperStore } from "../StepperRenderer"
import { ProposalPaymentStatus } from "app/proposalPayment/types"
import { StepType } from "../steps/Step"
import { useSafeTxStatus } from "app/core/hooks/useSafeTxStatus"
import TextLink from "../../TextLink"
import { getMostRecentPaymentAttempt } from "app/proposalPayment/utils"
import { chainIdToPath } from "app/core/utils/constants"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

const PaymentAction = ({ proposal, milestone, payment, isWithinStepper = true }) => {
  const mostRecentPaymentAttempt = getMostRecentPaymentAttempt(payment)
  const { roles: userRoles } = useGetUsersRoles(proposal.id)
  const userClientRole = userRoles.find((role) => role.type === ProposalRoleType.CLIENT)
  const userIsPayer = userClientRole
    ? userClientRole.account?.addressType === AddressType.WALLET
    : false
  const userIsSigner = userClientRole
    ? userClientRole.account?.addressType === AddressType.SAFE
    : false

  const activeRole = useStepperStore((state) => state.activeRole)
  const [quorumMet, setQuorumMet] = useState<boolean>(false)
  const [userHasSignedGnosisTx, setUserHasSignedGnosisTx] = useState<boolean>(false)
  const activeUser = useStore((state) => state.activeUser)
  const toggleExecutePaymentModalMap = useStore((state) => state.toggleExecutePaymentModalMap)
  const toggleQueueGnosisTransactionModalMap = useStore(
    (state) => state.toggleQueueGnosisTransactionModalMap
  )
  const toggleApproveGnosisTransactionModalMap = useStore(
    (state) => state.toggleApproveGnosisTransactionModalMap
  )
  const setActions = useStepperStore((state) => state.setActions)

  const {
    confirmations,
    isNonceBlocked,
    isLoading: isSafeTxStatusLoading,
  } = useSafeTxStatus(proposal, milestone, payment)

  useEffect(() => {
    if (userIsSigner && confirmations) {
      const quorum = userClientRole?.account?.data.quorum ?? 1
      const userHasSignedGnosisSafeTx = confirmations.some((confirmation) =>
        addressesAreEqual(confirmation.owner, activeUser?.address || "")
      )
      setUserHasSignedGnosisTx(userHasSignedGnosisSafeTx)
      if (confirmations.length >= quorum) {
        setQuorumMet(true)
      }
    }
  }, [userIsSigner, confirmations])

  const paymentComplete = mostRecentPaymentAttempt
    ? mostRecentPaymentAttempt.status !== ProposalPaymentStatus.QUEUED
    : false

  const currentMilestoneId = proposal?.milestones?.find(
    (milestone) => milestone.index === proposal?.currentMilestoneIndex
  )?.id
  const paymentIsActive = payment?.milestoneId === currentMilestoneId

  const actions = {
    ...(userIsPayer &&
      payment &&
      !paymentComplete &&
      paymentIsActive && {
        [ProposalRoleType.CLIENT]: (
          <Button
            type={isWithinStepper ? ButtonType.Secondary : ButtonType.Primary}
            isDisabled={!paymentIsActive}
            onClick={() => toggleExecutePaymentModalMap({ open: true, id: payment.id })}
            overrideWidthClassName="w-full"
          >
            Pay
          </Button>
        ),
      }),
    // user is signer on the gnosis safe
    // and payment exists (typescript)
    // and there is not a payment attempt
    ...(userIsSigner &&
      payment &&
      !mostRecentPaymentAttempt &&
      paymentIsActive && {
        [ProposalRoleType.CLIENT]: (
          <Button
            type={isWithinStepper ? ButtonType.Secondary : ButtonType.Primary}
            isDisabled={!paymentIsActive}
            onClick={() => toggleQueueGnosisTransactionModalMap({ open: true, id: payment.id })}
            overrideWidthClassName="w-full"
          >
            Queue and approve
            <ArrowRightIcon className="h-4 w-4 inline mb-1 ml-2 rotate-[315deg]" />
          </Button>
        ),
      }),
    // user is signer on the gnosis safe
    // and payment exists (typescript)
    // and there IS a payment attempt, meaning it has been queued
    // and the user has not yet signed the gnosis tx
    // TODO: approve flashes slightly after it's first executed.
    ...(userIsSigner &&
      payment &&
      paymentIsActive &&
      !!mostRecentPaymentAttempt &&
      mostRecentPaymentAttempt.status === ProposalPaymentStatus.QUEUED &&
      !userHasSignedGnosisTx &&
      !quorumMet && {
        [ProposalRoleType.CLIENT]: (
          <Button
            type={isWithinStepper ? ButtonType.Secondary : ButtonType.Primary}
            isDisabled={!paymentIsActive}
            onClick={() => toggleApproveGnosisTransactionModalMap({ open: true, id: payment.id })}
            overrideWidthClassName="w-full px-4"
          >
            Approve transaction
          </Button>
        ),
      }),

    ...(userIsSigner &&
      payment &&
      paymentIsActive &&
      !!mostRecentPaymentAttempt &&
      !!userHasSignedGnosisTx &&
      !quorumMet && {
        [ProposalRoleType.CLIENT]: (
          <Button
            type={ButtonType.Unemphasized}
            isDisabled={true}
            overrideWidthClassName="w-full px-4"
          >
            You have approved
          </Button>
        ),
      }),

    // user is signer on the gnosis safe
    // and payment exists (typescript)
    // and there IS mutliSigTransaction data on the payment, meaning it has been queued
    // and the quorum is met
    ...(userIsSigner &&
      payment &&
      paymentIsActive &&
      !!mostRecentPaymentAttempt &&
      mostRecentPaymentAttempt.status === ProposalPaymentStatus.QUEUED &&
      !!quorumMet && {
        [ProposalRoleType.CLIENT]: (
          <>
            <Button
              type={isWithinStepper ? ButtonType.Secondary : ButtonType.Primary}
              isDisabled={isSafeTxStatusLoading || isNonceBlocked || !paymentIsActive}
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
            {isNonceBlocked && (
              <span className="w-full text-xs text-concrete">
                This transaction is blocked by other pending transactions.{" "}
                <TextLink
                  url={`https://app.safe.global/transactions/queue?safe=${
                    chainIdToPath[payment.data.token.chainId]
                  }:${toChecksumAddress(payment.senderAddress)}`}
                >
                  Execute them on Gnosis
                </TextLink>{" "}
                to continue.
              </span>
            )}
          </>
        ),
      }),
    // user is signer on the gnosis safe
    // and payment exists (typescript)
    // and there IS mutliSigTransaction data on the payment, meaning it has been queued
    ...(userIsSigner &&
      payment &&
      paymentIsActive &&
      !!mostRecentPaymentAttempt &&
      (mostRecentPaymentAttempt.status === ProposalPaymentStatus.REJECTED ||
        mostRecentPaymentAttempt.status === ProposalPaymentStatus.FAILED) &&
      !quorumMet && {
        [ProposalRoleType.CLIENT]: (
          <Button
            type={isWithinStepper ? ButtonType.Secondary : ButtonType.Primary}
            isDisabled={!paymentIsActive}
            onClick={() => toggleQueueGnosisTransactionModalMap({ open: true, id: payment.id })}
            overrideWidthClassName="w-full"
          >
            Re-queue transaction
            <ArrowRightIcon className="h-4 w-4 inline mb-1 ml-2 rotate-[315deg]" />
          </Button>
        ),
      }),
  }

  useEffect(() => {
    setActions({
      step: StepType.PAYMENT,
      actions: actions,
    })
  }, [actions])

  if (activeRole && actions[activeRole]) {
    return actions[activeRole]
  } else {
    return <></>
  }
}

export default PaymentAction
