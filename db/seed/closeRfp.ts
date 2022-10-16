import { Rfp } from "app/rfp/types"
import db, { RfpStatus } from "db"

const seed = async () => {
  const rfpId = "835ef848-91c1-46da-bdf9-4b0a277fe808"

  const rfp = (await db.rfp.update({
    where: { id: rfpId },
    data: {
      status: RfpStatus.CLOSED,
    },
  })) as Rfp

  console.log(`${rfp?.data?.content?.title} is now ${rfp.status}`)
}

export default seed
