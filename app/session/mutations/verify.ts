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

  let siweMessage: SiweMessage
  let fields
  try {
    siweMessage = new SiweMessage(JSON.parse(message))
    fields = await siweMessage.validate(signature)
    if (fields.nonce !== ctx.session.nonce) {
      throw Error("Nonce mismatch.")
    }
  } catch (err) {
    console.error("Failed to verify wallet signature with error: ", err)
    // @ts-ignore
    throw Error("Failed to verify with Sign in with Ethereum.", { cause: err })
  }

  let account
  try {
    // `ctx.session.$create` allows us to create an authenticated session
    // where `ctx.session` stores the user's user id and we can authenticate
    // every page.
    account = await invoke(getAccountByAddress, { address: fields.address })
  } catch (err) {
    console.error("Failed to getAccountByAddress", err)
    // @ts-ignore
    throw new Error("We had a problem retrieving your account.", { cause: err })
  }

  if (account && account.id) {
    try {
      await ctx.session.$create({ userId: account.id, siwe: fields })
    } catch (err) {
      console.error("Failed to create session with error: ", err)
      // @ts-ignore
      throw new Error("Failed to create authenticated session.", { cause: err })
    }
  }

  try {
    await ctx.session.$setPublicData({ siwe: fields })
  } catch (err) {
    console.error("Failed to setPublicData with error: ", err)
    // @ts-ignore
    throw new Error("Failed to create session.", { cause: err })
  }

  return true
}
