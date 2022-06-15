import db from "db"
import * as z from "zod"

const CreateRfp = z.object({
  fundingAddress: z.string(),
  authorAddress: z.string(),
  terminalId: z.number(),
  startDate: z.date(),
  contentBody: z.string(),
  endDate: z.date().optional(),
})

export default async function createRfp(input: z.infer<typeof CreateRfp>) {
  const params = CreateRfp.parse(input)
  console.log(params)

  // fetch RFP from within this terminal
  // sort by desc
  // take 1
  // destructure the array so the variable is the single RFP, or null
  const [currentMaxLocalId] = await db.rfp.findMany({
    where: {
      terminalId: params.terminalId,
    },
    orderBy: {
      localId: "desc",
    },
    take: 1,
  })

  // if a result was returned, the new localId is prev + 1
  // else, none exist yet, so start it off with localId of 1
  const localId = currentMaxLocalId ? currentMaxLocalId.localId + 1 : 1

  const rfp = await db.rfp.create({
    data: {
      localId: localId,
      fundingAddress: params.fundingAddress,
      authorAddress: params.authorAddress,
      terminalId: params.terminalId,
      startDate: params.startDate,
      data: {
        content: {
          body: params.contentBody,
        },
      },
    },
  })

  return rfp
}
