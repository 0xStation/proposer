import { PrivyClient } from "@privy-io/privy-node"
import { requireEnv } from "./requireEnv"

const client = new PrivyClient(requireEnv("PRIVY_API_KEY"), requireEnv("PRIVY_API_SECRET"))

export const saveEmail = async (address: string, email: string) => {
  await client.put(address, "email", email)
}

export const getEmail = async (address: string) => {
  return (await client.get(address, "email"))?.text()
}
