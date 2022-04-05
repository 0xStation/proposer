import { RouteUrlObject } from "blitz"

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

    return `${window.location.hostname}${newPath}`
  }

  return `${window.location.hostname}${route.pathname}`
}
