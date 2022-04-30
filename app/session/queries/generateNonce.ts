import { Ctx } from "blitz"
import { generateNonce as genNonce } from "siwe"

export default async function getNonce(_: any, ctx: Ctx) {
  try {
    const nonce = genNonce()
    await ctx.session.$setPublicData({ nonce })
    return ctx.session.nonce
  } catch (err) {
    // TODO: add error handling
  }
}
