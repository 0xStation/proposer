export const requireEnv = (name?: string) => {
  if (name === undefined) {
    throw Error(`Missing environment variable: ${name}`)
  }
  const env = process.env[name]
  if (!env) {
    throw Error(`Missing environment variable: ${name}`)
  }
  return env
}
