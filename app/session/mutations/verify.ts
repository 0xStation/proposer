import { Ctx } from "blitz"
import { SiweMessage } from "siwe"
import * as z from "zod"

const Verify = z.object({
  message: z.string(),
  signature: z.string(),
})
export default async function verify(input: z.infer<typeof Verify>, ctx: Ctx) {
  const { message, signature } = Verify.parse(input)

  try {
    const siweMessage = new SiweMessage(JSON.parse(message))
    const fields = await siweMessage.validate(signature)
    if (fields.nonce !== ctx.session.nonce) {
      // TODO: add proper error handling
      return false
    }
    await ctx.session.$setPublicData({ siwe: fields })
    return true
  } catch (err) {
    // TODO: add error handling
  }
}
