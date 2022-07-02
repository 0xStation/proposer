import db from "db"
import * as z from "zod"
import { AccountTerminalWithTagsAndAccount } from "../types"
import { PAGINATION_TAKE } from "app/core/utils/constants"

const GetMembersByTerminalId = z.object({
  terminalId: z.number(),
  tagGroups: z.number().array().array(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(PAGINATION_TAKE),
})

export default async function getMembersByTerminalId(
  input: z.infer<typeof GetMembersByTerminalId>
) {
  const data = GetMembersByTerminalId.parse(input)
  const { page, terminalId, tagGroups, paginationTake } = data

  try {
    const members = await db.accountTerminal.findMany({
      where: {
        terminalId: terminalId,
        AND: tagGroups.map((tagGroup) => {
          return {
            tags: {
              some: {
                tagId: { in: tagGroup },
              },
            },
          }
        }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        account: true,
      },
      orderBy: {
        tags: {
          _count: "desc",
        },
      },
      take: paginationTake,
      skip: page * paginationTake,
    })

    return members as AccountTerminalWithTagsAndAccount[]
  } catch (err) {
    console.error("Error fetching members. Failed with error: ", err)
    return [] as AccountTerminalWithTagsAndAccount[]
  }
}
