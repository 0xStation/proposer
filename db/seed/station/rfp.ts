import db from "db"
import { PARTNERS, TEMPLATES } from "app/core/utils/constants"

const seed = async () => {
  const rfps = [
    {
      title: "Partnerships",
      submissionGuideline: "Submit your interest to contribute to the Station Network!",
      templateId: TEMPLATES.STATION.PARTNERSHIPS.id,
    },
  ]

  const newRfps = await db.rfp.createMany({
    data: rfps.map((rfp) => {
      return {
        accountAddress: PARTNERS.STATION.ADDRESS,
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

  console.log(newRfps.count + " rfps created for STATION")
}

export default seed
