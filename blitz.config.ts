import { BlitzConfig, sessionMiddleware, simpleRolesIsAuthorized } from "blitz"

const config: BlitzConfig = {
  middleware: [
    sessionMiddleware({
      cookiePrefix: "station-web",
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    config.module.rules.push({
      test: /\.(mp3)$/,
      type: "asset/resource",
      generator: {
        filename: "static/chunks/[path][name].[hash][ext]",
      },
    })
    return config
  },
}
module.exports = config
