import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import db from "db"

const seed = async () => {
  const foxesTemplateId = "835ef848-91c1-46da-bdf9-4b0a277fe808"

  const template = await db.proposalTemplate.create({
    data: {
      id: foxesTemplateId,
      chainId: 5, // change to 1 when on production
      accountAddress: PARTNERS.FOXES.ADDRESS, // change when seeding production
      data: {
        title: "Foxes Template",
        fields: TEMPLATES.FOXES.TERM,
      },
    },
  })

  console.log(`template id ${template?.id}`)
}

export default seed
