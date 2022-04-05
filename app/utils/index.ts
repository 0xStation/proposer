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
