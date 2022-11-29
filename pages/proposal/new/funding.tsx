import { useRouter } from "next/router"
import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import ProposalFormFunding from "app/proposalForm/components/funding/form"
import BackButtonLayout from "app/core/layouts/BackButtonLayout"
import { useEnsName } from "wagmi"

const ProposalNewFunding: BlitzPage = () => {
  const queryParams = useRouter().query
  const client = queryParams?.client as string
  const contributor = queryParams?.contributor as string
  const { data: clientEnsName } = useEnsName({
    address: client as `0x${string}`,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
  })
  const { data: contributorEnsName } = useEnsName({
    address: contributor as `0x${string}`,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
  })

  return (
    <ProposalFormFunding
      prefilledClient={clientEnsName || client}
      prefilledContributor={contributorEnsName || contributor}
    />
  )
}

ProposalNewFunding.suppressFirstRenderFlicker = true
ProposalNewFunding.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="New Proposal">
      <BackButtonLayout>{page}</BackButtonLayout>
    </Layout>
  )
}

export default ProposalNewFunding
