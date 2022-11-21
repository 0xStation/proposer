import { BlitzPage } from "@blitzjs/next"
import BackButtonLayout from "app/core/layouts/BackButtonLayout"
import type { GhIssueRfpContent } from "app/rfp/types"
import Layout from "app/core/layouts/Layout"
import RfpForm, { GhIssueParams } from "app/rfp/components/form/form"
import { gSSP } from "app/blitz-server"
import { getOctokit } from "app/utils/github"

export const getServerSideProps = gSSP<{ initialValues?: GhIssueRfpContent; ghIssueId?: number }>(
  async ({ params = {}, query, ctx }) => {
    const q = GhIssueParams.safeParse(query)
    if (!q.success) {
      return {
        props: {},
      }
    }

    try {
      const { installationId, repo, issue: issueNumber } = q.data
      const octokit = await getOctokit(installationId)

      const [repoOwner, repoName] = repo.split("/")
      const { data: issue } = await octokit.request(
        "GET /repos/{repoOwner}/{repoName}/issues/{issueNumber}",
        { repoOwner, repoName, issueNumber }
      )
      return {
        props: {
          initialValues: {
            title: issue.title,
            body: issue.body,
          },
          ghIssueId: issue.id,
        },
      }
    } catch (e) {
      // Bubble up the error to the frontend is something went wrong fetching GitHub
      return {
        props: {},
      }
    }
  }
)

const RfpNew: BlitzPage<{ initialValues?: GhIssueRfpContent; ghIssueId?: number }> = (props) => {
  return <RfpForm {...props} />
}

RfpNew.suppressFirstRenderFlicker = true
RfpNew.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="New RFP">
      <BackButtonLayout>{page}</BackButtonLayout>
    </Layout>
  )
}

export default RfpNew
