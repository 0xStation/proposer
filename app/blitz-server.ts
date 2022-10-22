import { isProd, isStaging } from "app/utils"

import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { setupBlitzServer } from "@blitzjs/next"
import { AuthServerPlugin, PrismaStorage } from "@blitzjs/auth"
import { BlitzLogger, BlitzServerMiddleware } from "blitz"
import db from "db"
import { authConfig } from "./blitz-client"

type AddressOrUserIdIsAuthorizedArgs = {
  ctx: any
  args: [addresses: string[], ids: number[]]
}

const addressOrUserIdIsAuthorized = ({ ctx, args }: AddressOrUserIdIsAuthorizedArgs) => {
  const [addresses, ids] = args

  // No filter applied, so everyone allowed
  if (addresses.length + ids.length === 0) return true

  const userAddress = ctx.session.$publicData.siwe.address
  const userId = ctx.session.$publicData.userId

  const addressAllowed = addresses?.some((address) => addressesAreEqual(address, userAddress))
  const idAllowed = ids?.some((id) => id === userId)
  return addressAllowed || idAllowed
}

export const { gSSP, gSP, api } = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      ...authConfig,
      storage: PrismaStorage(db),
      isAuthorized: addressOrUserIdIsAuthorized,
    }),
  ],
  logger: BlitzLogger({}),
})
