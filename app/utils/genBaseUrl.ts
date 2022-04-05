export const genBaseUrl = () => {
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.APP_ENV === "staging"
    ? "https://staging.station.express"
    : "https://app.station.express"
}
