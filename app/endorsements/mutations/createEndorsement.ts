import db from "db"
import * as z from "zod"
import { Endorsement } from "../types"

const CreateEndorsement = z.object({
  initiativeId: z.number(),
  endorseeId: z.number(),
  endorserId: z.number(),
  endorsementValue: z.number(),
})

export async function createEndorsement(input: z.infer<typeof CreateEndorsement>) {
  const params = CreateEndorsement.parse(input)

  try {
    const endorsement = await db.endorsement.create({
      data: {
        data: {
          // points is the same as endorsement value for now -
          // we may add a multiplier to apply to points down the road.
          inputValue: params.endorsementValue,
        },
        initiativeId: params.initiativeId,
        endorseeId: params.endorseeId,
        endorser: { connect: { id: params.endorserId } },
        endorsementValue: params.endorsementValue,
      },
      include: {
        endorser: true,
      },
    })
    return endorsement as Endorsement
  } catch (err) {
    console.error(`Error: could not create endorsement. Failed with ${err}`)
    return {}
  }
}

export default createEndorsement
