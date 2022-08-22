import { BlitzConfig, sessionMiddleware } from "blitz"

type AddressOrUserIdIsAuthorizedArgs = {
  ctx: any
  args: [addresses?: string[], ids?: number[]]
}

const addressOrUserIdIsAuthorized = ({ ctx, args }: AddressOrUserIdIsAuthorizedArgs) => {
  const [addresses, ids] = args

  // No filter applied, so everyone allowed
  if ((addresses?.length || 0) + (ids?.length || 0) === 0) return true

  const userAddress = ctx.session.$publicData.siwe.address
  const userId = ctx.session.$publicData.userId

  const addressAllowed = addresses?.some((address) => address === userAddress) ?? true
  const idAllowed = ids?.some((id) => id === userId) ?? true
  return addressAllowed || idAllowed
}

const config: BlitzConfig = {
  middleware: [
    sessionMiddleware({
      // vercel_url guarantees uniqueness per preview environment
      // remove '/' and '.' from url as cookie only allows '-' and '_'
      cookiePrefix: `${
        process.env.NEXT_PUBLIC_VERCEL_URL?.replace(/[./]/g, "") || "development"
      }_session`,

      isAuthorized: addressOrUserIdIsAuthorized,
    }),
  ],
  images: {
    domains: [
      "pbs.twimg.com",
      "user-images.githubusercontent.com",
      "station-images.nyc3.digitaloceanspaces.com",
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/station/explore",
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
