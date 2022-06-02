import { BlitzConfig, sessionMiddleware, simpleRolesIsAuthorized } from "blitz"

const config: BlitzConfig = {
  middleware: [
    sessionMiddleware({
      cookiePrefix: `${process.env.APP_ENV || "development"}_session`,
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
