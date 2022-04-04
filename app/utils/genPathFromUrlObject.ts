import { RouteUrlObject } from "blitz"
import { genBaseUrl } from "./genBaseUrl"

export const genPathFromUrlObject = (route: RouteUrlObject) => {
  const baseUrl = genBaseUrl()

  if (route.query) {
    let newPath = Object.keys(route.query).reduce((path, queryArg) => {
      let queries = route.query

      // ugh TS forcing me to check for queries even though we wouldn't even be in here if there were none
      if (!queries) {
        return path
      }

      return path.replace(`[${queryArg}]`, queries[queryArg])
    }, route.pathname)

    return `${baseUrl}${newPath}`
  }

  return `${baseUrl}${route.pathname}`
}
