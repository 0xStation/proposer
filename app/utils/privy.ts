import { PrivyClient } from "@privy-io/privy-node"
import { requireEnv } from "./requireEnv"

const client = new PrivyClient(requireEnv("PRIVY_API_KEY"), requireEnv("PRIVY_API_SECRET"))

export const saveEmail = async (address: string, email: string) => {
  try {
    await client.put(address, "email", email)
  } catch (e) {
    console.error("saveEmail failure: ", e)
    throw e
  }
}

export const getEmail = async (address: string) => {
  try {
    const res = await client.get(address, "email")
    const email = res?.text()
    // convert to null if empty string for easier consistency of handling not-populated types
    return email !== "" ? email : null
  } catch (e) {
    console.error("getEmail failure: ", e)
    throw e
  }
}