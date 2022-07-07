export const getUrlHost = () => {
  const hostname = process.env.APP_HOSTNAME
  if (!hostname) {
    return "http://localhost:3000"
  }
  return hostname
}
