import { useRouter } from "next/router"
import { useMutation, invalidateQuery, useQuery } from "@blitzjs/rpc"
import { useState } from "react"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import useSignature from "app/core/hooks/useSignature"
import approveProposal from "app/proposal/mutations/approveProposal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import getProposalById from "../queries/getProposalById"
import { genProposalApprovalDigest } from "app/signatures/proposalSignature"
import { Proposal } from "app/proposal/types"
import useGetRolesUserCanApprove from "app/core/hooks/useGetRolesUserCanApprove"
import getRolesByProposalId from "app/proposalRole/queries/getRolesByProposalId"
import { PAYMENT_TERM_MAP } from "app/core/utils/constants"
import networks from "app/utils/networks.json"

export const ApproveProposalModal = ({
  isOpen,
  setIsOpen,
  proposal,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  proposal: Proposal
}) => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [approveProposalMutation] = useMutation(approveProposal)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const isPaymentProposal = proposal.data.totalPayments && proposal.data.totalPayments?.length > 0

  const { roles, isLoading: loadingRolesUserCanApprove } = useGetRolesUserCanApprove({
    proposalId: proposal?.id,
    proposalVersion: proposal?.version,
  })

  const { signMessage } = useSignature()

  const initiateSignature = async () => {
    try {
      if (!activeUser || !activeUser?.address) {
        setIsOpen(false)
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "You must connect your wallet.",
        })
      }

      const message = genProposalApprovalDigest({
        proposalHash: proposal.data.proposalHash,
        proposalId: proposal?.id as string,
        proposalVersion: proposal?.version,
      })
      const signature = await signMessage(message)

      // no signature - user must have denied signature
      if (!signature) {
        setIsLoading(false)
        return
      }

      const representingRoles = roles.map((role) => {
        return {
          roleId: role.id,
          complete: role.oneSignerNeededToComplete,
        }
      })

      try {
        await approveProposalMutation({
          proposalId: proposal?.id,
          proposalVersion: proposal?.version,
          signerAddress: activeUser!.address!,
          message,
          signature,
          representingRoles,
        })
        invalidateQuery(getRolesByProposalId)
        // invalidate proposal query to get ipfs hash post-approval
        // since an ipfs has is created on proposal approval
        invalidateQuery(getProposalById)
        router.replace(router.asPath)
        setIsOpen(false)
        setToastState({
          isToastShowing: true,
          type: "success",
          message: "Your signature has been saved.",
        })
      } catch (e) {
        console.error(e)
      }
      setIsLoading(false)
    } catch (e) {
      setIsLoading(false)
      console.error(e)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: e.message,
      })
    }
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Confirm your approval</h3>
        {isPaymentProposal ? (
          <p className="mt-2">
            Approval represents your agreement to the terms outlined in this proposal. Please review
            the payment terms below carefully before approving.
          </p>
        ) : (
          <p className="mt-2">Signal your acceptance of this proposal </p>
        )}
        {
          // if no payments exist for this proposal, doesn't make sense to show any of the following metadata
          isPaymentProposal && (
            <div className="mt-8 mb-4 space-y-2 flex flex-col">
              <div className="grid grid-cols-4">
                <span className="text-concrete col-span-1">Payment</span>
                <span className="col-span-3">
                  {proposal.data.totalPayments?.map((payment, idx) => {
                    return (
                      <span key={`payment-${idx}`}>
                        {payment.amount} {payment.token.symbol}
                      </span>
                    )
                  })}
                </span>
              </div>
              <div className="grid grid-cols-4">
                <span className="text-concrete col-span-1">Terms</span>
                <span className="col-span-3">
                  {PAYMENT_TERM_MAP[proposal.data.paymentTerms || ""].copy}
                </span>
              </div>
              <div className="grid grid-cols-4">
                <span className="text-concrete col-span-1">Network</span>
                <span className="col-span-3">
                  {proposal.data.totalPayments?.[0]?.token.chainId
                    ? networks[proposal.data.totalPayments?.[0]?.token.chainId].name
                    : "Not recognized"}
                </span>
              </div>
            </div>
          )
        }

        <div className="mt-8 flex items-center justify-end">
          <Button
            className="mr-2"
            type={ButtonType.Secondary}
            onClick={() => {
              setIsLoading(false)
              setIsOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            isSubmitType={true}
            isLoading={isLoading}
            isDisabled={isLoading || loadingRolesUserCanApprove}
            onClick={() => {
              setIsLoading(true)
              initiateSignature()
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ApproveProposalModal
