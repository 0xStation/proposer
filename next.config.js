const { withBlitz } = require("@blitzjs/next")

const config = {
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
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    // config.module.rules.push({
    //   test: /\.(mp4|webm|ogg|swf|ogv)$/,
    //   use: [
    //     {
    //       loader: "file-loader",
    //       options: {
    //         publicPath: `./.next/static/videos/`,
    //         outputPath: `${isServer ? "../" : ""}static/videos/`,
    //         name: "[name].[ext]",
    //       },
    //     },
    //   ],
    // })
    return config
  },
}

module.exports = withBlitz(config)
