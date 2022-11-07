import { SocialConnection } from "app/rfp/types"
import db from "db"

const seed = async () => {
  const templateId = "835ef848-91c1-46da-bdf9-4b0a277fe808"

  const rfps = await db.rfp.findMany({
    where: {
      templateId,
    },
  })

  rfps.forEach(async (rfp) => {
    await db.rfp.update({
      where: {
        id: rfp.id,
      },
      data: {
        data: {
          ...Object(rfp.data),
          requiredSocialConnections: [SocialConnection.DISCORD],
        },
      },
    })
  })

  console.log(rfps.length + " rfps updated")
}

export default seed
