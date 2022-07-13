export const requireEnv = (name: string) => {
  const env = process.env[name]
  if (!env) {
    throw Error(`Missing environment variable: ${name}`)
  }
  return env
}
