import React, { useState } from "react"
import Layout from "app/core/layouts/Layout"
import ResetSignaturesModal from "app/core/components/ResetSignaturesModal"
import { EditForm } from "app/proposal/components/EditForm"

const EditProposalPage = () => {
  const [isResetSignaturesModalOpen, setIsResetSignaturesModalOpen] = useState<boolean>(false)

  return (
    <Layout title="Edit Proposal">
      <ResetSignaturesModal
        isOpen={isResetSignaturesModalOpen}
        setIsOpen={setIsResetSignaturesModalOpen}
      />
      <EditForm />
    </Layout>
  )
}

export default EditProposalPage
