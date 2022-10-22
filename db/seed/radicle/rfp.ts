import db from "db"
import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import { RfpMetadata } from "app/rfp/types"

const seed = async () => {
  const rfps = [
    {
      title: "Contribute ideas to the Radicle x Giveth partnership",
      submissionGuideline:
        "Radicle is partnering with Giveth, a community focused on Building the Future of Giving, to reimagine donation on the blockchain. We're inviting developers and contributor members of the Radicle and Giveth community to propose ideas on how the two ecosystems can best work together.",
      templateId: TEMPLATES.RADICLE.GIVETH_IDEAS.id,
    },
  ]

  const newRfps = await db.rfp.createMany({
    data: rfps.map((rfp) => {
      return {
        accountAddress: PARTNERS.RADICLE.ADDRESS,
        templateId: rfp.templateId,
        data: {
          content: {
            title: rfp.title,
            body: "",
            oneLiner: "",
            submissionGuideline: rfp.submissionGuideline,
          },
        },
      }
    }),
  })

  console.log(newRfps.count + " rfps created for RADICLE")
}

export default seed
