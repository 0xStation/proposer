import { Rfp, RfpMetadata } from "app/rfp/types"
import db from "../index"

const seed = async () => {
  const rfps = (await db.rfp.findMany({})) as Rfp[]
  rfps.forEach(async (rfp) => {
    const newMetadata: RfpMetadata = {
      ...Object(rfp.data),
      content: {
        title: rfp.data.content.title,
        body: rfp.data.content.submissionGuideline || "",
        submissionGuideline: rfp.data.content.submissionGuideline || "",
        oneLiner: rfp.data.content.oneLiner,
      },
    }

    await db.rfp.update({
      where: {
        id: rfp.id,
      },
      data: {
        data: newMetadata,
      },
    })
  })
}

export default seed
