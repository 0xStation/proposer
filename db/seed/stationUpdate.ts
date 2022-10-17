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
          data: {
            ...Object(rfp.data),
            content: {
              title: rfp.data?.content?.title,
              body: "",
              oneLiner: "",
              submissionGuideline:
                "Please make sure your submission is 125+ words, and double check for typos.\n\nSubmissions should be fully aligned with, and inclusive of, already established Philosophical Foxes lore. The best entries will connect to other entries in a way that expands the known lore and creates new connections that were previously unknown. Entries should be written in the voice of fox historians in the future. This means that they can be opinionated and inclusive of knowledge not yet known to our current generation of foxes.",
            },
          },
        },
      })
    )
  )

  console.log(count + " rfps updated for Station")
}

export default seed
