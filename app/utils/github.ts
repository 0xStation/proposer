import { Octokit } from "@octokit/core"
import { createAppAuth } from "@octokit/auth-app"

const appOctokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_PRIVATE_KEY,
  },
})

export async function getOctokit(installationId: number): Promise<Octokit> {
  // credentials are cached in the global object so there shouldn't be a new request each time.
  const octokit = await appOctokit.auth({
    type: "installation",
    installationId,
    factory: ({ octokitOptions, ...auth }) =>
      new Octokit({ ...octokitOptions, auth, authStrategy: createAppAuth }),
  })
  return octokit as any
}
