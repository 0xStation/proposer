import db from "db"
import * as z from "zod"

const GetEndorsementValueSumByApplication = z.object({
  initiativeId: z.number(),
  endorseeId: z.number(),
})

export async function getEndorsementValueSumByApplication(
  input: z.infer<typeof GetEndorsementValueSumByApplication>
) {
  const params = GetEndorsementValueSumByApplication.parse(input)

  try {
    const endorsementValueSum = await db.endorsement.aggregate({
      _sum: {
        endorsementValue: true,
      },
      where: {
        initiativeId: params.initiativeId,
        endorseeId: params.endorseeId,
      },
    })

    return endorsementValueSum?._sum?.endorsementValue
  } catch (err) {
    console.error(`Error retrieving sum of endorsement values. Failed with error ${err}`)
    return 0
  }
}

export default getEndorsementValueSumByApplication
