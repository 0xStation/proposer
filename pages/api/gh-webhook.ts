import type { NextApiRequest, NextApiResponse } from "next"
import type { WebhookEvent, IssuesOpenedEvent } from "@octokit/webhooks-types"
import { Octokit } from "@octokit/core"
import { createAppAuth } from "@octokit/auth-app"

const appOctokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_PRIVATE_KEY,
  },
})

function isRFP(evt: WebhookEvent): boolean {
  const isOpenedOrLabeled = "action" in evt && (evt.action === "opened" || evt.action === "labeled")
  const isRFPLabel =
    "issue" in evt && !!evt.issue?.labels?.some((label) => label.name.toLowerCase() === "rfp")
  return isOpenedOrLabeled && isRFPLabel
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    if (req.headers["x-github-event"] === "issues") {
      const evt: WebhookEvent = req.body
      if (isRFP(evt) && "installation" in evt && !!evt.installation) {
        const ioe = evt as any as IssuesOpenedEvent
        const owner = ioe.repository.owner.login
        const repo = ioe.repository.name
        const number = ioe.issue.number
        try {
          // credentials should get cached when handler is called multiple times.
          const octokit = (await appOctokit.auth({
            type: "installation",
            installationId: evt.installation.id,
            factory: ({ octokitOptions, ...auth }) =>
              new Octokit({ ...octokitOptions, auth, authStrategy: createAppAuth }),
          })) as any as Octokit

          await octokit.request("POST /repos/{owner}/{repo}/issues/{number}/comments", {
            repo,
            owner,
            number,
            body: `[Publish your RFP on Station](https://b612-2806-107e-13-516f-ecf5-234e-d3e4-efa0.ngrok.io)`,
          })
        } catch (e) {
          return res.status(500).json({ response: "error", message: "failed to add label" })
        }
      }
    }
    res.status(200).json({ response: "ok" })
  } else {
    res.status(500).json({ response: "error", message: "only post operation is supported" })
  }
}
