import React, { useState } from "react"
import Layout from "app/core/layouts/Layout"
import ResetSignaturesModal from "app/core/components/ResetSignaturesModal"
import { EditProposalForm } from "app/proposal/components/EditProposalForm"
import { useParam } from "@blitzjs/next"

// TODO: add non-author gating here
const EditProposalPage = () => {
  const [isResetSignaturesModalOpen, setIsResetSignaturesModalOpen] = useState<boolean>(true)
  const proposalId = useParam("proposalId")

  return (
    <Layout title="Edit Proposal">
      <ResetSignaturesModal
        isOpen={isResetSignaturesModalOpen}
        setIsOpen={setIsResetSignaturesModalOpen}
        proposalId={proposalId as string}
      />
      <EditProposalForm />
    </Layout>
  )
}

export default EditProposalPage
