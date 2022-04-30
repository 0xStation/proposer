import { Ctx } from "blitz"

export default async function logout(_: any, ctx: Ctx) {
  // Revoke the current user session, logging them out.
  return await ctx.session.$revoke()
}
