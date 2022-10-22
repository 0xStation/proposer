import { AuthClientPlugin } from "@blitzjs/auth"
import { setupBlitzClient } from "@blitzjs/next"
import { BlitzRpcPlugin } from "@blitzjs/rpc"
import { isProd, isStaging } from "app/utils"

export const authConfig = {
  cookiePrefix: `${isProd() ? "production" : isStaging() ? "staging" : "development"}_session`,
}

export const { withBlitz } = setupBlitzClient({
  plugins: [AuthClientPlugin(authConfig), BlitzRpcPlugin({})],
})
