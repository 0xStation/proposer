import React, { useState } from "react"
import Layout from "app/core/layouts/Layout"
import ResetSignaturesModal from "app/core/components/ResetSignaturesModal"
import { EditProposalForm } from "app/proposal/components/EditProposalForm"

// TODO: add non-author gating here
const EditProposalPage = () => {
  const [isResetSignaturesModalOpen, setIsResetSignaturesModalOpen] = useState<boolean>(false)

  return (
    <Layout title="Edit Proposal">
      <ResetSignaturesModal
        isOpen={isResetSignaturesModalOpen}
        setIsOpen={setIsResetSignaturesModalOpen}
      />
      <EditProposalForm />
    </Layout>
  )
}

export default EditProposalPage
