import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { Ctx, invoke } from "blitz"
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
      throw Error("nonce mismatch.")
    }

    // `ctx.session.$create` allows us to create an authenticated session
    // where `ctx.session` stores the user's user id and we can authenticate
    // every page.
    const account = await invoke(getAccountByAddress, { address: fields.address })

    if (account && account.id) {
      try {
        await ctx.session.$create({ userId: account.id, siwe: fields })
      } catch (err) {
        console.error("Failed to create session with error: ", err)
        return false
      }
    }

    await ctx.session.$setPublicData({ siwe: fields })

    return true
  } catch (err) {
    console.error("Failed to verify wallet signature with error: ", err)
    return false
  }
}
