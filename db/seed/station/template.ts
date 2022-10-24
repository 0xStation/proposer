import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import db from "db"

const seed = async () => {
  const templates = [TEMPLATES.STATION.NEWSTAND]

  templates.forEach(async (template: { id: string; title: string; fields: any[] }) => {
    const updatedTemplate = await db.proposalTemplate.upsert({
      where: {
        id: template.id,
      },
      create: {
        id: template.id,
        chainId: PARTNERS.STATION.CHAIN_ID,
        accountAddress: PARTNERS.STATION.ADDRESS,
        data: {
          title: template.title,
          fields: template.fields,
        },
      },
      update: {
        chainId: PARTNERS.STATION.CHAIN_ID,
        accountAddress: PARTNERS.STATION.ADDRESS,
        data: {
          title: template.title,
          fields: template.fields,
        },
      },
    })

    console.log(`template id ${updatedTemplate?.id}`)
  })
}

export default seed
