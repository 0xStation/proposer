import React, { useState } from "react"
import { useParam } from "@blitzjs/next"
import { gSSP } from "app/blitz-server"
import Layout from "app/core/layouts/Layout"
import ResetSignaturesModal from "app/core/components/ResetSignaturesModal"
import { EditProposalForm } from "app/proposal/components/EditProposalForm"
import { invoke } from "@blitzjs/rpc"
import getProposalById from "app/proposal/queries/getProposalById"
import { ProposalRoleType } from "@prisma/client"

export const getServerSideProps = gSSP(async ({ params = {}, ctx }) => {
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
  const activeUserIsAuthor = proposal?.roles?.find(
    (role) => role.type === ProposalRoleType.AUTHOR && role.address === ctx?.session?.siwe?.address
  )

  if (!activeUserIsAuthor) {
    return {
      redirect: {
        destination: `/403`,
        permanent: false,
      },
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
})

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
