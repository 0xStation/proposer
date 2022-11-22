import type { NextApiRequest, NextApiResponse } from "next"
import type { WebhookEvent, IssuesOpenedEvent } from "@octokit/webhooks-types"
import { getOctokit } from "app/utils/github"

// Might be a better way to do this but we're server side and the NextApiRequest
// type doesn't provide the origin url.
const DEFAULT_HOST = "app.station.express"

// Logic for deciding whether we can flag this issue as RFP and comment on it:
// We can safely use the RFP label as a way for users to express intent. If an issue
// is labeled before it is created, we will still receive an event.
function isRFP(evt: WebhookEvent): boolean {
  const isLabeled = "action" in evt && evt.action === "labeled"
  const isRFPLabel =
    "issue" in evt && !!evt.issue?.labels?.some((label) => label.name.toLowerCase() === "rfp")
  return isLabeled && isRFPLabel
}

// There are many things this handler can handle in the future as it receives any changes
// made on GitHub throughout the lifecycle of issues. Currently this only
// comments under an issue with a link to create a new RFP.
// Next we'll want any edits to the issue body to be suggested as edits on our version
// for the user to approve or sign automatically.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    if (req.headers["x-github-event"] === "issues") {
      const evt: WebhookEvent = req.body
      if (isRFP(evt) && "installation" in evt && !!evt.installation) {
        const ioe = evt as any as IssuesOpenedEvent
        const repo = ioe.repository.full_name
        const number = ioe.issue.number
        try {
          const octokit = await getOctokit(evt.installation.id)

          // use a custom host for development and staging environments.
          const host = req.headers.host ?? DEFAULT_HOST

          // must be split as octokit endpoint will uri encode it and break the uri path.
          const [repoOwner, repoName] = repo.split("/")
          await octokit.request("POST /repos/{repoOwner}/{repoName}/issues/{number}/comments", {
            repoName,
            repoOwner,
            number,
            // This text will be commented on the issue as authored by the Station bot.
            body: `[Publish your RFP on Station](https://${host}/workspace/undefined/rfp/new/contributor?installationId=${
              evt.installation.id
            }&repo=${encodeURIComponent(repo)}&issue=${number})`,
          })
        } catch (e) {
          return res
            .status(500)
            .json({
              response: "error",
              message: e.message,
              appId: process.env.GITHUB_APP_ID,
              pk: process.env.GITHUB_PRIVATE_KEY,
            })
        }
      }
    }
    res.status(200).json({ response: "ok" })
  } else {
    res.status(500).json({ response: "error", message: "only post operation is supported" })
  }
}
