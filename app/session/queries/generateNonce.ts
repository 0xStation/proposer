import { Ctx } from "blitz"
import { generateNonce as genNonce } from "siwe"

export default async function getNonce(_: any, ctx: Ctx) {
  try {
    const nonce = genNonce()
    await ctx.session.$setPublicData({ nonce })
    return ctx.session.nonce
  } catch (err) {
    console.error("Failed to generate and retrieve nonce with error: ", err)
    throw Error(err)
  }
}
