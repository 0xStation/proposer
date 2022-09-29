import { BlitzConfig, sessionMiddleware } from "blitz"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { isProd, isStaging } from "app/utils"

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

const config: BlitzConfig = {
  middleware: [
    sessionMiddleware({
      // vercel_url guarantees uniqueness per preview environment
      // remove '/' and '.' from url as cookie only allows '-' and '_'
      cookiePrefix: `${isProd() ? "production" : isStaging() ? "staging" : "development"}_session`,

      isAuthorized: addressOrUserIdIsAuthorized,
    }),
  ],
  images: {
    domains: [
      "pbs.twimg.com",
      "user-images.githubusercontent.com",
      "station-images.nyc3.digitaloceanspaces.com",
      "cdn.discordapp.com",
      "avatar.tobi.sh",
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/proposal/new",
        permanent: true,
      },
    ]
  },
  /* Uncomment this to customize the webpack config
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    return config
  },
  */
}

module.exports = config
