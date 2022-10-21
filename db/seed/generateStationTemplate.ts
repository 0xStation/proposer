import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import db from "db"

const seed = async () => {
  const stationTemplateId = "cd28828c-e51a-4796-80f5-e39d4cc43fab"

  const template = await db.proposalTemplate.upsert({
    where: {
      id: stationTemplateId,
    },
    create: {
      id: stationTemplateId,
      chainId: 5, // change to 1 when on production
      accountAddress: PARTNERS.STATION.ADDRESS, // change on production
      data: {
        title: "Partnerships",
        fields: TEMPLATES.STATION.TERM,
      },
    },
    update: {
      id: stationTemplateId,
      chainId: 5, // change to 1 when on production
      accountAddress: PARTNERS.STATION.ADDRESS, // change on production
      data: {
        title: "Partnerships",
        fields: TEMPLATES.STATION.TERM,
      },
    },
  })

  console.log(`template id ${template?.id}`)
}

export default seed
