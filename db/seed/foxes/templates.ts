import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import db from "db"

const seed = async () => {
  const templates = [TEMPLATES.FOXES.TERMS]

  templates.forEach(async (template: { id: string; title: string; fields: any[] }) => {
    const updatedTemplate = await db.proposalTemplate.upsert({
      where: {
        id: template.id,
      },
      create: {
        id: template.id,
        chainId: PARTNERS.FOXES.CHAIN_ID,
        accountAddress: PARTNERS.FOXES.ADDRESS,
        data: {
          title: template.title,
          fields: template.fields,
        },
      },
      update: {
        chainId: PARTNERS.FOXES.CHAIN_ID,
        accountAddress: PARTNERS.FOXES.ADDRESS,
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
