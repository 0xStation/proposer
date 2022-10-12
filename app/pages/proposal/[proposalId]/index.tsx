import { useState, useEffect } from "react"
import { BlitzPage, useQuery, useParam, GetServerSideProps, invoke } from "blitz"
import Layout from "app/core/layouts/Layout"
import getProposalById from "app/proposal/queries/getProposalById"
import { ProposalViewHeaderNavigation } from "app/proposal/components/viewPage/ProposalViewHeaderNavigation"
import ReadMore from "app/core/components/ReadMore"
import { TotalPaymentView } from "app/core/components/TotalPaymentView"
import RoleSignaturesView from "app/core/components/RoleSignaturesView"
import { Proposal } from "app/proposal/types"
import Stepper from "app/proposal/components/Stepper"

const steps = [
  {
    description: "Author sends proposal",
    getStatus: (proposal) => {
      return proposal.status === "DRAFT" ? "current" : "complete"
    },
    valid: (_proposal) => true,
    action: {
      title: "Send",
      behavior: () => console.log("sending"),
    },
  },
  {
    description: "Client, contributor, and author approve the proposal",
    valid: (_proposal) => true,
    getStatus: (proposal) => {
      return proposal.status === "APPROVED"
        ? "complete"
        : proposal.status === "DRAFT"
        ? "upcoming"
        : "current"
    },
    action: {
      title: "Approve",
      behavior: () => console.log("sending"),
    },
  },
  {
    description: "Client processes advanced payment",
    getStatus: (proposal) => {
      return "upcoming"
    },
    valid: (_proposal) => false,
  },
  {
    description: "Client reviews deliverables and proposal",
    getStatus: (proposal) => {
      return "upcoming"
    },
    valid: (_proposal) => false,
  },
  {
    description: "Client processes the final payment",
    getStatus: (proposal) => {
      return "upcoming"
    },
    valid: (_proposal) => false,
  },
]

export const getServerSideProps: GetServerSideProps = async ({ params = {} }) => {
  const { proposalId } = params
  // regex checks if a string is a uuid
  // https://melvingeorge.me/blog/check-if-string-valid-uuid-regex-javascript
  const isUuidRegex =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi

  if (!proposalId || !isUuidRegex.test(proposalId as string)) {
    return {
      notFound: true,
    }
  }

  const proposal = await invoke(getProposalById, {
    id: proposalId,
  })

  if (!proposal) {
    return {
      notFound: true,
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
}

const ViewProposal: BlitzPage = () => {
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(
    getProposalById,
    { id: proposalId },
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )
  const [stepperSteps, setStepperSteps] = useState<any>([])
  useEffect(() => {
    if (proposal) {
      const filteredSteps = steps
        .filter((step) => {
          return step.valid(proposal)
        })
        .map((step) => {
          return {
            ...step,
            status: step.getStatus(proposal),
          }
        })

      setStepperSteps(filteredSteps)
    }
  }, [proposal])

  console.log(proposal)

  return (
    <Layout title="View Proposal">
      <div className="w-full md:min-w-1/2 md:max-w-2xl mx-auto pb-9 relative">
        <Stepper steps={stepperSteps} className="absolute right-[-340px] top-0" />
        <ProposalViewHeaderNavigation />
        <ReadMore className="mt-9 mb-9">{proposal?.data?.content?.body}</ReadMore>
        <RoleSignaturesView proposal={proposal as Proposal} className="mt-9" />
        {(proposal?.data.totalPayments || []).length > 0 && (
          <TotalPaymentView proposal={proposal!} className="mt-9" />
        )}
      </div>
    </Layout>
  )
}

ViewProposal.suppressFirstRenderFlicker = true

export default ViewProposal
