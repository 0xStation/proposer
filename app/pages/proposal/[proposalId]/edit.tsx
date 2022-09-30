import { BlitzPage, useParam, useQuery, useSession, useRouter, Routes } from "blitz"
import { useEffect } from "react"
import Layout from "app/core/layouts/Layout"
import { ProposalForm } from "app/proposal/components/ProposalForm"
import getProposalById from "app/proposal/queries/getProposalById"
import { Proposal } from "app/proposal/types"
import { ProposalRoleType } from "@prisma/client"

const EditProposal: BlitzPage = () => {
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(getProposalById, { id: proposalId }, { suspense: false })
  const session = useSession({ suspense: false })
  const router = useRouter()

  const authorRole = proposal?.roles?.find((role) => role.type === ProposalRoleType.AUTHOR)
  const clientRole = proposal?.roles?.find((role) => role.type === ProposalRoleType.CLIENT)
  const contributorRole = proposal?.roles?.find(
    (role) => role.type === ProposalRoleType.CONTRIBUTOR
  )

  useEffect(() => {
    if (proposal && (!session?.siwe?.address || session?.siwe?.address !== authorRole?.address)) {
      router.push(Routes.ViewProposal({ proposalId }))
    }
  }, [session?.siwe?.address, proposal?.id, authorRole?.address])

  const firstProposalPayment = proposal?.data?.totalPayments?.[0]

  const initialValues = {
    client: [clientRole?.address],
    contributor: [contributorRole?.address],
    title: proposal?.data?.content?.title,
    body: proposal?.data?.content?.body,
    network: firstProposalPayment?.token?.chainId,
    selectedToken: { ...firstProposalPayment?.token },
    paymentAmount:
      firstProposalPayment?.amount
        ?.toFixed(firstProposalPayment?.token?.decimals)
        .replace(/(?:\.0+|(\.\d+?)0+)$/, "$1") // trim the trailing 0's from using `toFixed`
        .toString() || "",
    paymentTerms: proposal?.data?.paymentTerms,
  }

  return (
    <Layout title="Edit proposal">
      {proposal && session?.siwe?.address ? (
        <ProposalForm
          isEdit={true}
          proposalToEdit={proposal as Proposal}
          initialValues={initialValues}
        />
      ) : (
        <div>Loading...</div>
      )}
    </Layout>
  )
}

EditProposal.suppressFirstRenderFlicker = true

export default EditProposal
