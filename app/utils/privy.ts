import { PrivyClient } from "@privy-io/privy-node"
import { requireEnv } from "./requireEnv"

const client = new PrivyClient(
  requireEnv("PRIVY_API_KEY") as string,
  requireEnv("PRIVY_API_SECRET") as string
)

export const saveEmail = async (address: string, email: string) => {
  try {
    const res = await client.put(address, "email", email)
    return res.text()
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

export const getEmails = async (addresses: string[]) => {
  const promises = addresses.map((address) => getEmail(address))
  try {
    const emails = await Promise.all(promises)
    return emails.filter((email) => !!email) as string[] // remove empty strings
  } catch (e) {
    console.error(e)
    throw e
  }
}
