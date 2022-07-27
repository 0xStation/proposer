import { getEmail } from "app/utils/privy"
import db from "db"
import * as z from "zod"

const GetEmailByAccountAddress = z.object({
  address: z.string(),
})

export default async function getEmailByAccountAddress(
  input: z.infer<typeof GetEmailByAccountAddress>
) {
  try {
    const params = GetEmailByAccountAddress.parse(input)
    const email = await getEmail(params.address as string)

    if (!email) {
      return null
    }

    return email
  } catch (err) {
    console.error("Error fetching user's email. Failed with err: ", err)
    return null
  }
}
