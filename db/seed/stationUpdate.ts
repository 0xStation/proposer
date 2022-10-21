import { PARTNERS } from "app/core/utils/constants"
import db from "../index"
import { TokenType } from "@prisma/client"
import { Rfp } from "app/rfp/types"

const seed = async () => {
  const rfps = await db.rfp.findMany({
    where: {
      accountAddress: PARTNERS.STATION.ADDRESS,
    },
  })

  const count = await db.$transaction(
    rfps.map((rfp: Rfp) =>
      db.rfp.update({
        where: {
          id: rfp.id,
        },
        data: {
          templateId: "cd28828c-e51a-4796-80f5-e39d4cc43fab",
          data: {
            ...Object(rfp.data),
            content: {
              title: rfp.data?.content?.title,
              body: "",
              oneLiner: "",
              submissionGuideline: "Submit your interest to contribute to the Station Network!",
            },
            // singleTokenGate: {
            //   token: {
            //     chainId: 1,
            //     address: "0xBa767D65a7164E151783e42994Bd475509F256Dd",
            //     type: TokenType.ERC721,
            //     name: "Station Labs Passport",
            //     symbol: "STATION",
            //   },
            //   minBalance: "1",
            // },
          },
        },
      })
    )
  )

  console.log(count + " rfps updated for Station")
}

export default seed
