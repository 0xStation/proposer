import { RouteUrlObject } from "blitz"

export const genBaseUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:3000"
  }
  return `https://${window.location.hostname}`
}

export const genPathFromUrlObject = (route: RouteUrlObject) => {
  if (route.query) {
    let newPath = Object.keys(route.query).reduce((path, queryArg) => {
      let queries = route.query

      // ugh TS forcing me to check for queries even though we wouldn't even be in here if there were none
      if (!queries) {
        return path
      }

      return path.replace(`[${queryArg}]`, queries[queryArg])
    }, route.pathname)

    return `${genBaseUrl()}${newPath}`
  }

  return `${genBaseUrl()}${route.pathname}`
}

export const isDev = () => {
  return !!(process.env.NEXT_PUBLIC_VERCEL_ENV === "development")
}

export const isStaging = () => {
  return !!(process.env.NEXT_PUBLIC_VERCEL_ENV === "preview")
}

export const isProd = () => {
  return !!(process.env.NEXT_PUBLIC_VERCEL_ENV === "production")
}
