import { useEffect, useState } from "react"
import { useQuery } from "@blitzjs/rpc"
import { ArrowRightIcon } from "@heroicons/react/solid"
import { ProposalRoleType, AddressType } from "@prisma/client"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import useGetUsersRoles from "app/core/hooks/useGetUsersRoles"
import { ProposalMilestoneStatus } from "app/proposalMilestone/types"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { getMilestoneStatus } from "app/proposalMilestone/utils"
import getGnosisTxStatus from "app/proposal/queries/getGnosisTxStatus"
import { getNetworkGnosisUrl } from "app/core/utils/networkInfo"
import { useStepperStore } from "../StepperRenderer"
import { StepType } from "../steps/Step"
import { useSafeTxStatus } from "app/core/hooks/useSafeTxStatus"

const PaymentAction = ({ proposal, milestone, payment }) => {
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

  const confirmations = useSafeTxStatus(proposal, milestone, payment)

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

  const paymentComplete = !!payment?.transactionHash

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
    // and there is not yet any mutliSigTransaction data on the payment, meaning it is not queued
    ...(userIsSigner &&
      payment &&
      !payment.data.multisigTransaction && {
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
    // and there IS mutliSigTransaction data on the payment, meaning it has been queued
    // and the user has not yet signed the gnosis tx
    // TODO: approve flashes slightly after it's first executed.
    ...(userIsSigner &&
      payment &&
      !!payment.data.multisigTransaction &&
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
      !!payment.data.multisigTransaction &&
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
      !!payment.data.multisigTransaction &&
      !!quorumMet && {
        [ProposalRoleType.CLIENT]: (
          <Button
            type={ButtonType.Secondary}
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
