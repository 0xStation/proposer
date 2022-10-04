import * as z from "zod"
import { getEmail } from "app/utils/privy"
import { Ctx } from "blitz"

const GetAccountEmail = z.object({
  address: z.string(),
})

export default async function getAccountEmail(input: z.infer<typeof GetAccountEmail>, ctx: Ctx) {
  const params = GetAccountEmail.parse(input)

  // can only fetch email if calling from SIWE auth'd session of self
  ctx.session.$authorize([params.address], [])

  // storing email with Privy, not our database, so we need to fetch it directly
  const email = await getEmail(params.address)

  return email || ""
}
