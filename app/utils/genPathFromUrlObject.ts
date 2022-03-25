import { RouteUrlObject } from "blitz"

export const genPathFromUrlObject = (route: RouteUrlObject) => {
  const baseUrl =
    process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://app.station.express"

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
