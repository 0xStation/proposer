import { PARTNERS } from "app/core/utils/constants"
import db from "../index"
import { TokenType } from "@prisma/client"
import { Rfp } from "app/rfp/types"

const seed = async () => {
  const rfps = await db.rfp.findMany({
    where: {
      accountAddress: PARTNERS.FOXES.ADDRESS,
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
                address: "0x55256178aFE74082c4f9aFEF7E40fec949c1b499",
                type: TokenType.ERC721,
                name: "Philosophical Foxes",
                symbol: "FOX",
              },
            },
          },
        },
      })
    )
  )

  console.log(count + " rfps updated for Foxes")
}

export default seed
