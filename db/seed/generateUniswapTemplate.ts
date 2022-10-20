import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import db from "db"

const seed = async () => {
  const uniswapTemplateId = "96058a8b-b1f5-4ba5-811d-e3415eccb3ce"

  const template = await db.proposalTemplate.create({
    data: {
      id: uniswapTemplateId,
      chainId: 5, // change to 1 when on production
      accountAddress: PARTNERS.UNISWAP.ADDRESS, // change on production
      data: {
        title: "Uniswap Template",
        fields: TEMPLATES.UNISWAP.TERM,
      },
    },
  })

  console.log(`template id ${template?.id}`)
}

export default seed
