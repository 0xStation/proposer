import { BlitzConfig, sessionMiddleware, simpleRolesIsAuthorized } from "blitz"

const config: BlitzConfig = {
  middleware: [
    sessionMiddleware({
      // vercel_url guarantees uniqueness per preview environment
      // remove '/' and '.' from url as cookie only allows '-' and '_'
      cookiePrefix: `${
        process.env.NEXT_PUBLIC_VERCEL_URL?.replace(/[./]/g, "") || "development"
      }_session`,

      isAuthorized: simpleRolesIsAuthorized,
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
