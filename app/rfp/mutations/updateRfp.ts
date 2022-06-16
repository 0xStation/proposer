import db from "db"
import * as z from "zod"

// going to be calling this from edit RFP page, so we will still be passing in all of these data
// just bc they might not be changed does not mean we will be omitting them, because the form
// will still be capturing them while they are filled in for the edit view.
const UpdateRfp = z.object({
  rfpId: z.string(), // uuid as string?
  fundingAddress: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
})

export default async function updateRfp(input: z.infer<typeof UpdateRfp>) {
  const existingRfp = await db.rfp.findUnique({
    where: {
      id: input.rfpId,
    },
  })

  if (!existingRfp) {
    console.error(`An RFP with localId ${input.rfpId} does not exist.`)
    return null
  }

  const rfp = await db.rfp.update({
    where: { id: input.rfpId },
    data: {
      fundingAddress: input.fundingAddress,
      startDate: input.startDate,
      endDate: input.endDate,
      data: {
        content: {
          title: input.contentTitle,
          body: input.contentBody,
        },
      },
    },
  })

  return rfp
}
