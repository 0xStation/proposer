import db from "db"
import * as z from "zod"
import { Endorsement } from "../types"

const CreateEndorsement = z.object({
  initiativeId: z.number(),
  endorserId: z.number(),
  endorseeId: z.number(),
  endorsementValue: z.number(),
})

export async function createEndorsement(input: z.infer<typeof CreateEndorsement>) {
  const params = CreateEndorsement.parse(input)

  try {
    const endorsement = await db.endorsement.create({
      data: {
        data: {
          endorsementValue: params.endorsementValue,
          // points is the same as endorsement value for now -
          // we may add a multiplier to apply to points down the road.
          pointsValue: params.endorsementValue,
        },
        endorser: { connect: { id: params.endorserId } },
        endorsee: { connect: { id: params.endorseeId } },
        initiative: { connect: { id: params.initiativeId } },
      },
      include: {
        endorser: true,
        endorsee: true,
      },
    })
    return endorsement as Endorsement
  } catch (err) {
    console.error(`Error: could not create endorsement. Failed with ${err}`)
    return {}
  }
}

export default createEndorsement
