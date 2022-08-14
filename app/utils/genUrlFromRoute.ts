export const genUrlFromRoute = (route) => {
  const parsedPath = Object.keys(route.query).reduce((path, queryKey) => {
    path = path.replace(`[${queryKey}]`, route.query[queryKey])
    return path
  }, route.pathname)

  return parsedPath
}
