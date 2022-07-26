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
  signature: z.string(),
})

export default async function updateRfp(input: z.infer<typeof UpdateRfp>) {
  try {
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
          signature: input.signature,
        },
      },
    })

    return rfp
  } catch (error) {
    throw error
  }
}
