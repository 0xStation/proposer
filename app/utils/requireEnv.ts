export const requireEnv = (name: string) => {
  const env = process.env[name]
  if (!env) {
    return ""
    // throw Error(`Missing environment variable: ${name}`)
  }
  return env
}
