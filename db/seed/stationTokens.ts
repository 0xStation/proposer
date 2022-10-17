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
    rfps.map((rfp) =>
      db.rfp.update({
        where: {
          id: rfp.id,
        },
        data: {
          data: {
            ...Object(rfp.data),
            singleTokenGate: {
              token: {
                chainId: 1,
                address: "0xBa767D65a7164E151783e42994Bd475509F256Dd",
                type: TokenType.ERC721,
                name: "Station Labs Passport",
                symbol: "STATION",
              },
            },
          },
        },
      })
    )
  )

  console.log(count + " rfps updated for Station")
}

export default seed
