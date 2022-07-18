import { useMutation, useRouter, invalidateQuery } from "blitz"
import { useSignTypedData, useToken } from "wagmi"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import createCheck from "app/check/mutations/createCheck"
import approveProposal from "app/proposal/mutations/approveProposal"
import { ZERO_ADDRESS } from "app/core/utils/constants"
import decimalToBigNumber from "app/core/utils/decimalToBigNumber"
import { TypedDataTypeDefinition } from "app/types"
import getChecksByProposalId from "../../check/queries/getChecksByProposalId"
import { Check } from "@prisma/client"
import { truncateString } from "app/core/utils/truncateString"
import { formatDate } from "app/core/utils/formatDate"
import { InformationCircleIcon } from "@heroicons/react/solid"

export const SignApprovalProposalModal = ({ isOpen, setIsOpen, proposal, rfp, checks }) => {
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [approveProposalMutation] = useMutation(approveProposal)

  const [createCheckMutation] = useMutation(createCheck, {
    onError: (error: Error) => {
      console.error(error)
    },
  })

  let { signTypedDataAsync: signApproval } = useSignTypedData()
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
        fundingAddress: rfp.checkbook.address,
        chainId: rfp.checkbook.chainId,
        recipientAddress: proposal?.data.funding.recipientAddress,
        tokenAddress: proposal?.data.funding.token,
        tokenAmount: proposal?.data.funding.amount, // store as decimal value instead of BigNumber
      })
      invalidateQuery(getChecksByProposalId)
    }

    const signature = await approveCheck(check, decimals)

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
          signature: signature,
        })
        router.replace(router.asPath)
        setIsOpen(false)
        setToastState({
          isToastShowing: true,
          type: "success",
          message: "Your approval moves this proposal a step closer to reality.",
        })
        try {
          // if this approval makes proposal reach quorum, send notification to collaborators
          if (proposal.approvals.length + 1 === rfp.checkbook.quorum) {
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

  const approveCheck = async (check: Check, decimals: number) => {
    // 3 parts to a typed-data signature:
    //   1. domain: metadata about the contract and where it is located
    //   2. types: definition of the typed object being signed at once
    //   3. value: values that fit into the types definition

    /**
     * DOMAIN
     * top-level definition of where this signature will be used
     * `name` is hardcoded to "Checkbook" in each contract
     * `version` is also harcoded to "1" in each contract
     * `chainId` should be the actual id for the contract, 4 is hardcoded for Rinkeby testing
     * `verifyingContract` is the address of the contract that will be consuming this signature (the checkbook)
     */
    const domain = {
      name: "Checkbook", // keep hardcoded
      version: "1", // keep hardcoded
      chainId: check.chainId,
      verifyingContract: check.fundingAddress,
    }

    /**
     * TYPES
     * definition of the object representing a single check, order and types matter
     * types per value are using Solidity types
     * `Check` is capitalized to mimic Solidity structs
     * `recipient` is the address of the check recipient
     * `token` is the address of the currency token where the zero address represents ETH
     * `amount` is the uint representation of amount of tokens to move (requires BigNumber package in js/ts)
     * `deadline` is the expiry date of this check represented as a unix timestamp
     * `nonce` is the unique identifier for this check to prevent double spending
     */
    const types: TypedDataTypeDefinition = {
      Check: [
        { name: "recipient", type: "address" },
        { name: "token", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    }

    /**
     * VALUE
     * instantiation of a typed object reflecting `types`
     * all required data comes from the `Check` entity to guarantee consistent values across all of its approvals
     * notice that `decimalToBigNumber` is needed to convert db values into contract-readable values
     */

    const value = {
      recipient: check.recipientAddress,
      token: check.tokenAddress,
      amount: decimalToBigNumber(check.tokenAmount, decimals),
      deadline: check.deadline.valueOf(),
      nonce: check.nonce,
    }

    // prompt the Metamask signature modal
    try {
      const signature = await signApproval({
        domain,
        types,
        value,
      })
      return signature
    } catch (e) {
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Signature denied",
      })
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
        <div className="flex justify-between mt-4 pb-4 border-b border-concrete">
          <div className="flex flex-row space-x-2 items-center">
            <span className="font-bold">Expiration date</span>
            <span className="relative group">
              <InformationCircleIcon className="h-4 w-4" />
              <span className="p-2 bg-wet-concrete rounded hidden group-hover:block absolute top-[100%] w-[150px] text-xs">
                The date the check expires.{" "}
                <a href="#" className="text-electric-violet">
                  Learn more.
                </a>
              </span>
            </span>
          </div>
          <span>{checks && formatDate(getCheckDeadline())}</span>
        </div>
        <div className="flex justify-between mt-4">
          <span className="font-bold">Total amount</span>
          <span>{proposal?.data.funding.amount}</span>
        </div>
        <div className="flex justify-between mt-4 pb-4 border-b border-concrete">
          <div className="flex flex-row space-x-2 items-center">
            <span className="font-bold">Network fee</span>
            <span className="relative group">
              <InformationCircleIcon className="h-4 w-4" />
              <span className="p-2 bg-wet-concrete rounded hidden group-hover:block absolute top-[100%] w-[150px] text-xs">
                Not sure what the copy is for this.{` `}
                <a href="#" className="text-electric-violet">
                  Learn more.
                </a>
              </span>
            </span>
          </div>
          <span>{parseFloat(proposal?.data.funding.amount) * 0.025} (2.5%)</span>
        </div>
        <div className="flex justify-between mt-4">
          <div className="flex flex-col">
            <span className="font-bold">Total</span>
            <span className="text-xs text-concrete">
              The funds will be deployed when the check is cashed.
            </span>
          </div>
          <span>
            {parseFloat(proposal?.data.funding.amount) * 0.025 +
              parseFloat(proposal?.data.funding.amount)}
          </span>
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
