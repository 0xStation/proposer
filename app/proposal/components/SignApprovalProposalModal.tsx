import { useMutation, useRouter, invalidateQuery } from "blitz"
import { useToken } from "wagmi"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import useSignature from "app/core/hooks/useSignature"
import createCheck from "app/check/mutations/createCheck"
import approveProposal from "app/proposal/mutations/approveProposal"
import { ZERO_ADDRESS } from "app/core/utils/constants"
import getChecksByProposalId from "../../check/queries/getChecksByProposalId"
import { truncateString } from "app/core/utils/truncateString"
import { formatDate } from "app/core/utils/formatDate"
import { InformationCircleIcon } from "@heroicons/react/solid"

export const SignApprovalProposalModal = ({ isOpen, setIsOpen, proposal, checkbook, checks }) => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [approveProposalMutation] = useMutation(approveProposal)

  const [createCheckMutation] = useMutation(createCheck, {
    onError: (error: Error) => {
      console.error(error)
    },
  })

  let { signMessage } = useSignature()

  const { data: tokenData } = useToken({
    ...(!!proposal?.data.funding.token &&
      proposal?.data.funding.token !== ZERO_ADDRESS && { address: proposal?.data.funding.token }),
  })
  const decimals = proposal?.data.funding.token === ZERO_ADDRESS ? 18 : tokenData?.decimals || 0

  const createOrFindCheckAndFetchSignature = async () => {
    let check = checks[0]
    if (!check) {
      // need to create a check if it does not exist
      check = await createCheckMutation({
        proposalId: proposal?.id,
        fundingAddress: checkbook.address,
        chainId: checkbook.chainId,
        recipientAddress: proposal?.data.funding.recipientAddress,
        tokenAddress: proposal?.data.funding.token,
        tokenAmount: proposal?.data.funding.amount, // store as decimal value instead of BigNumber
      })
    }

    const signature = await signMessage(check.data.signatureMessage)

    // user must have denied signature
    if (!signature) {
      return
    }

    if (!activeUser?.address) {
      setIsOpen(false)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "You must connect your wallet in order to approve proposals.",
      })
    } else {
      try {
        await approveProposalMutation({
          proposalId: proposal?.id,
          checkId: check.id,
          signerAddress: activeUser.address,
          signature,
          signatureMessage: check.data.signatureMessage,
        })

        setToastState({
          isToastShowing: true,
          type: "success",
          message: "Your approval moves this proposal a step closer to reality.",
        })
        // refresh check fetching to render check if quorum is now hit
        invalidateQuery(getChecksByProposalId)
        router.replace(router.asPath)
        setIsOpen(false)
        try {
          // if this approval makes proposal reach quorum, send notification to collaborators
          if (proposal.approvals.length + 1 === checkbook.quorum) {
            await fetch("/api/notify/proposal/approved", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                proposalId: proposal.id,
              }),
            })
          }
        } catch (e) {
          console.error(e)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  const getCheckDeadline = () => {
    let check = checks[0]
    if (!check) {
      const deadline = new Date()
      // automatic handling for rounding up on years and days for overflow -> https://www.w3schools.com/jsref/jsref_setmonth.asp
      deadline.setMonth(deadline.getMonth() + 1)
      return deadline
    }
    return check.deadline
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Sign to confirm approval</h3>
        <p className="mt-2">
          Your approval moves this proposal a step closer to reality. Once this approval meets the
          quorum the check will be generated for the fund recipient to cash.
        </p>

        <div className="flex justify-between mt-4">
          <span className="font-bold">Fund recipient</span>
          <span>{truncateString(proposal?.data.funding.recipientAddress)}</span>
        </div>
        <div className="flex justify-between mt-4">
          <span className="font-bold">Token</span>
          <span>{truncateString(proposal?.data.funding.token)}</span>
        </div>
        <div className="flex justify-between mt-4">
          <div className="flex flex-row space-x-2 items-center">
            <span className="font-bold">Expiration date</span>
            <span className="relative group">
              <InformationCircleIcon className="h-4 w-4" />
              <span className="p-2 bg-wet-concrete rounded hidden group-hover:block absolute top-[100%] w-[150px] text-xs">
                The date the check expires.{" "}
                <a
                  href="https://station-labs.gitbook.io/station-product-manual/for-daos-communities/checkbook"
                  className="text-electric-violet"
                >
                  Learn more.
                </a>
              </span>
            </span>
          </div>
          <span>{checks && formatDate(getCheckDeadline())}</span>
        </div>
        <div className="flex justify-between mt-4">
          <span className="font-bold">Total</span>
          <span>{proposal?.data.funding.amount}</span>
        </div>
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
              createOrFindCheckAndFetchSignature()
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
