import { useMutation } from "blitz"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import { useSignMessage } from "wagmi"
import { verifyMessage } from "ethers/lib/utils"
import approveProposal from "app/proposal/mutations/approveProposal"

export const SignApprovalProposalModal = ({ isOpen, setIsOpen, proposal, rfp }) => {
  // Todo: fill out the body of the signature to whatever we want it to be
  const message = `Approving a proposal`
  const [approveProposalMutation] = useMutation(approveProposal)
  const setToastState = useStore((state) => state.setToastState)
  const { error, signMessage } = useSignMessage({
    onSuccess(data, variables) {
      const address = verifyMessage(variables.message, data)
      executeApprovals(rfp, proposal, data, address)
    },
  })

  const executeApprovals = async (rfp, proposal, signature, address) => {
    const approvals = await approveProposalMutation({
      proposalId: proposal.id,
      chainId: rfp.checkbook.chainId,
      signerAddress: address,
      signature: signature,
      fundingAddress: rfp.checkbook.address,
      recipientAddress: proposal.data.funding.recipientAddress,
      tokenAddress: proposal.data.funding.token,
      tokenAmount: proposal.data.funding.amount,
    })
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Sign to confirm</h3>
        <p className="mt-2">
          You won’t be able to update your decision. Signature proves that this important action is
          taken by you and no one else.
        </p>
        <div className="mt-8">
          <button
            type="button"
            className="text-electric-violet border border-electric-violet mr-2 py-1 w-[98px] rounded hover:opacity-75"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 w-[98px] rounded hover:opacity-75"
            onClick={() => {
              signMessage({ message })
            }}
          >
            Sign
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default SignApprovalProposalModal
