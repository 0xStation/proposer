import { TEMPLATES } from "app/core/utils/constants"
import db from "db"

const seed = async () => {
  const foxesTemplateId = "835ef848-91c1-46da-bdf9-4b0a277fe808"

  const template = await db.template.create({
    data: {
      id: foxesTemplateId,
      chainId: 5, // change to 1 when on production
      data: {
        title: "Foxes Template",
        fields: TEMPLATES.STATION.TERM,
      },
    },
  })

  console.log(`template ${template}`)
}

export default seed
