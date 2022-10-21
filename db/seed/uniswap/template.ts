import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import db from "db"

const seed = async () => {
  const templates = [TEMPLATES.UNISWAP.POAP_DESIGN, TEMPLATES.UNISWAP.COMMUNITY_NEWSLETTER]

  templates.forEach(async (template: { id: string; title: string; fields: any[] }) => {
    const updatedTemplate = await db.proposalTemplate.upsert({
      where: {
        id: template.id,
      },
      create: {
        id: TEMPLATES.UNISWAP.POAP_DESIGN.id,
        chainId: PARTNERS.UNISWAP.CHAIN_ID,
        accountAddress: PARTNERS.UNISWAP.ADDRESS,
        data: {
          title: template.title,
          fields: template.fields,
        },
      },
      update: {
        chainId: PARTNERS.UNISWAP.CHAIN_ID,
        accountAddress: PARTNERS.UNISWAP.ADDRESS,
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
