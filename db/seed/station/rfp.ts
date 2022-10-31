import db from "db"
import { PARTNERS, TEMPLATES } from "app/core/utils/constants"

const seed = async () => {
  const rfps = [
    {
      title: "Station is seeking stories about contributing in web3",
      body: "Working in web3 is fun but can be inaccessible or clunky for many of us.\n\nSpecifically:\n\n- Remaining anonymous or pseudonymous;\n\n- Negotiating a favorable rate and timeliness of payment;\n\n- Accruing reputation and legitimacy;\n\n- Navigating how to make the most impact in a community;\n\n- Finding projects that best suit your skills and interests;\n\n- Discovering like-minded collaborators.\n\nWe want to hear your story about your experience in the space and, if any, advice you can share with newcomers. You may be a creator transitioning into web3; a technologist, operator, investor, or builder who is new to the space; a researcher in decentralized society and governance; an NFT creator; a DAO leader or member; or an anonymous contributor to a crypto  project, just to name a few.\n\nWe'll reward the best stories with $500 USDC; publish them on Newstand, Station's media publication; and share on our social media channels and in our newsletter.",
      templateId: TEMPLATES.STATION.NEWSTAND.id,
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
            oneLiner: "",
            body: rfp.body,
          },
        },
      }
    }),
  })

  console.log(newRfps.count + " rfps created for STATION")
}

export default seed
