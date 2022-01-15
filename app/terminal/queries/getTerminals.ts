import db from "db"
import * as z from "zod"
import { Terminal } from "../types"

const GetTerminals = z.object({
  pagination: z
    .object({
      page: z.number().default(0),
      per_page: z.number().default(4),
    })
    .optional(),
})

export default async function getTerminals(input: z.infer<typeof GetTerminals>) {
  const params = GetTerminals.parse(input)

  let args: any = {}
  if (params.pagination) {
    args.take = params.pagination.per_page
    args.skip = params.pagination.page * params.pagination.per_page
  }

  const terminals = await db.terminal.findMany(args)
  if (!terminals) {
    return []
  }

  return terminals as Terminal[]
}
