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

    // `ctx.session.$create` allows us to create an authenticated session
    // where `ctx.session` stores the user's user id and we can authenticate
    // every page. Sadly, there is a bug that's thrown on create within the blitz
    // app so we can't use $create until there's a minor update :'(
    // const account = await invoke(getAccountByAddress, { address: fields.address })

    // if (account && account.id) {
    //   try {
    //     await ctx.session.$create({ userId: account.id, siwe: fields })
    //   } catch (err) {
    //     console.error(err)
    //   }
    // }

    return true
  } catch (err) {
    // TODO: add error handling
  }
}
