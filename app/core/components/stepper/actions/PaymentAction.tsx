import { useEffect, useState } from "react"
import { useQuery } from "@blitzjs/rpc"
import { ArrowRightIcon } from "@heroicons/react/solid"
import { ProposalRoleType, AddressType } from "@prisma/client"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import useGetUsersRoles from "app/core/hooks/useGetUsersRoles"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import getGnosisTxStatus from "app/proposal/queries/getGnosisTxStatus"
import { getNetworkGnosisUrl } from "app/core/utils/networkInfo"
import { useStepperStore } from "../StepperRenderer"
import { ProposalPayment, ProposalPaymentStatus } from "app/proposalPayment/types"
import { StepType } from "../steps/Step"
import { useSafeTxStatus } from "app/core/hooks/useSafeTxStatus"
import TextLink from "../../TextLink"

const PaymentAction = ({ proposal, milestone, payment, isWithinStepper = true }) => {
  const mostRecentPaymentAttempt = payment.data?.history?.[payment.data.history.length - 1]
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

  const actions = {
    ...(userIsPayer &&
      payment &&
      !paymentComplete && {
        [ProposalRoleType.CLIENT]: (
          <Button
            type={ButtonType.Secondary}
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
      !mostRecentPaymentAttempt && {
        [ProposalRoleType.CLIENT]: (
          <button
            onClick={() => toggleQueueGnosisTransactionModalMap({ open: true, id: payment.id })}
            className="mb-2 sm:mb-0 font-bold border rounded px-4 h-[35px] text-electric-violet border-electric-violet bg-transparent hover:opacity-70 w-full"
          >
            Queue and approve
            <ArrowRightIcon className="h-4 w-4 inline mb-1 ml-2 rotate-[315deg]" />
          </button>
        ),
      }),
    // user is signer on the gnosis safe
    // and payment exists (typescript)
    // and there IS a payment attempt, meaning it has been queued
    // and the user has not yet signed the gnosis tx
    // TODO: approve flashes slightly after it's first executed.
    ...(userIsSigner &&
      payment &&
      !!mostRecentPaymentAttempt &&
      mostRecentPaymentAttempt.status === ProposalPaymentStatus.QUEUED &&
      !userHasSignedGnosisTx &&
      !quorumMet && {
        [ProposalRoleType.CLIENT]: (
          <Button
            type={ButtonType.Secondary}
            onClick={() => toggleApproveGnosisTransactionModalMap({ open: true, id: payment.id })}
            overrideWidthClassName="w-full px-4"
          >
            Approve transaction
          </Button>
        ),
      }),

    ...(userIsSigner &&
      payment &&
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
      !!mostRecentPaymentAttempt &&
      mostRecentPaymentAttempt.status === ProposalPaymentStatus.QUEUED &&
      !!quorumMet && {
        [ProposalRoleType.CLIENT]: (
          <>
            <Button
              type={isWithinStepper ? ButtonType.Secondary : ButtonType.Primary}
              isDisabled={isSafeTxStatusLoading || isNonceBlocked}
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
                  url={`${getNetworkGnosisUrl(payment.data.token.chainId)}:${
                    payment.data.multisigTransaction.address
                  }/transactions/queue`}
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
      !!mostRecentPaymentAttempt &&
      (mostRecentPaymentAttempt.status === ProposalPaymentStatus.REJECTED ||
        mostRecentPaymentAttempt.status === ProposalPaymentStatus.FAILED) &&
      !quorumMet && {
        [ProposalRoleType.CLIENT]: (
          <button
            className="mb-2 sm:mb-0 font-bold border rounded px-4 h-[35px] bg-electric-violet border-electric-violet text-tunnel-black w-full"
            onClick={() => toggleQueueGnosisTransactionModalMap({ open: true, id: payment.id })}
          >
            Re-queue transaction
            <ArrowRightIcon className="h-4 w-4 inline mb-1 ml-2 rotate-[315deg]" />
          </button>
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
