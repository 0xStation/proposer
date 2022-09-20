import { useParam, useQuery, BlitzPage } from "blitz"
import { useEffect, useState } from "react"
import { ProposalViewHeaderNavigation } from "app/proposalNew/components/viewPage/ProposalViewHeaderNavigation"
import Layout from "app/core/layouts/Layout"
import getProposalNewById from "app/proposalNew/queries/getProposalNewById"
import { ProposalNewStatus, ProposalRoleType } from "@prisma/client"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import useStore from "app/core/hooks/useStore"
import truncateString from "app/core/utils/truncateString"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import ExecutePaymentModal from "app/proposalNew/components/ExecutePaymentModal"
import { CheckCircleIcon } from "@heroicons/react/solid"
import { PROPOSAL_MILESTONE_STATUS_MAP } from "app/core/utils/constants"
import { getMilestoneStatus } from "app/proposalMilestone/utils"
import getMilestonesByProposal from "app/proposalMilestone/queries/getMilestonesByProposal"
import { ProposalMilestoneStatus } from "app/proposalMilestone/types"

export const ProposalPayments: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const proposalId = useParam("proposalId") as string
  const [isExecutePaymentModalOpen, setIsExecutePaymentModalOpen] = useState<boolean>(false)
  const [proposal] = useQuery(
    getProposalNewById,
    { id: proposalId },
    {
      suspense: false,
      enabled: !!proposalId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )
  const [milestones] = useQuery(
    getMilestonesByProposal,
    { proposalId: proposalId },
    {
      suspense: false,
      enabled: !!proposalId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )

  const proposalContainsPayment = (proposal?.payments && proposal?.payments.length > 0) || false
  const userIsPayer = proposal?.roles.some(
    (role) =>
      role.role === ProposalRoleType.CLIENT &&
      addressesAreEqual(activeUser?.address || "", role.address)
  )
  const paymentComplete = !!proposal?.payments?.[0]?.transactionHash

  const showPayInformation =
    proposalContainsPayment && proposal?.status === ProposalNewStatus.APPROVED

  return (
    <Layout title="View Payments">
      <ExecutePaymentModal
        isOpen={isExecutePaymentModalOpen}
        setIsOpen={setIsExecutePaymentModalOpen}
        proposal={proposal}
        payment={proposal?.payments?.[0]}
      />
      <div className="w-full md:min-w-1/2 md:max-w-2xl mx-auto h-full">
        <ProposalViewHeaderNavigation />
        {showPayInformation ? (
          <div className={` mt-9 border border-b border-concrete rounded-2xl px-6 py-9`}>
            <span
              className={`${
                PROPOSAL_MILESTONE_STATUS_MAP[getMilestoneStatus(proposal, milestones?.[0]) || ""]
                  ?.color
              } rounded-full px-2 py-1 flex items-center space-x-1 w-fit mb-4`}
            >
              <span className="text-xs uppercase text-tunnel-black font-bold">
                {
                  PROPOSAL_MILESTONE_STATUS_MAP[getMilestoneStatus(proposal, milestones?.[0]) || ""]
                    ?.copy
                }
              </span>
            </span>
            <div className=" text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
              <span className="basis-32 mb-2 tracking-wider">From</span>
              <span className="basis-32 ml-6 mb-2 tracking-wider">To</span>
              <span className="basis-28 ml-6 mb-2 tracking-wider">Token</span>
              <span className="basis-28 ml-6 mb-2 tracking-wider">Amount</span>
            </div>
            {/* show all payments within milestone block */}
            {milestones?.[0]?.payments?.map((payments) => (
              <div className="w-full flex flex-row items-end" key={payments?.id}>
                <span className="basis-32 mb-2 tracking-wider">
                  {truncateString(payments?.senderAddress)}
                </span>
                <span className="basis-32 ml-6 mb-2 tracking-wider">
                  {truncateString(payments?.recipientAddress)}
                </span>
                <span className="basis-28 ml-6 mb-2 tracking-wider">
                  {payments?.data?.token?.symbol}
                </span>
                <span className="basis-28 ml-6 mb-2 tracking-wider">{payments?.amount}</span>
              </div>
            ))}
            {userIsPayer &&
              getMilestoneStatus(proposal, milestones?.[0]) ===
                ProposalMilestoneStatus.IN_PROGRESS &&
              (!paymentComplete ? (
                <Button
                  overrideWidthClassName="w-full"
                  className="mt-4"
                  type={ButtonType.Secondary}
                  onClick={() => setIsExecutePaymentModalOpen(true)}
                >
                  Pay
                </Button>
              ) : (
                <button
                  className="mt-4 mb-2 sm:mb-0 border rounded w-[300px] sm:w-[400px] md:w-[614px] h-[35px] mr-3 opacity-70 bg-electric-violet border-electric-violet text-tunnel-black cursor-not-allowed"
                  disabled
                >
                  <CheckCircleIcon className="h-5 w-5 inline mb-1 mr-2" />
                  Paid
                </button>
              ))}
          </div>
        ) : Boolean(proposal?.roles) ? (
          <div className="w-full h-full flex items-center flex-col sm:mt-0">
            <h1 className="text-2xl font-bold w-[295px] text-center mt-44">No payments queued</h1>
            <p className="text-base w-[320px] text-center mt-2.5">
              Payments queue and history will be displayed here after the proposal has been signed
              by all collaborators.
            </p>
          </div>
        ) : (
          <div className="mt-9 h-[260px] w-full flex flex-row rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse" />
        )}
      </div>
    </Layout>
  )
}

ProposalPayments.suppressFirstRenderFlicker = true
export default ProposalPayments
