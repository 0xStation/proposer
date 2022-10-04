import * as z from "zod"
import { getEmail } from "app/utils/privy"

const GetAccountEmail = z.object({
  address: z.string().optional(),
})

export default async function getAccountEmail(input: z.infer<typeof GetAccountEmail>) {
  const params = GetAccountEmail.parse(input)

  if (!params.address) {
    return null
  }

  // storing email with Privy, not our database, so we need to fetch it directly
  const email = await getEmail(params.address)

  return email || ""
}
