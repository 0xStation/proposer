import { PARTNERS } from "app/core/utils/constants"
import db, { TokenType } from "../index"
import { Rfp } from "app/rfp/types"

const seed = async () => {
  const rfps = await db.rfp.findMany({
    where: {
      accountAddress: PARTNERS.FOXES.ADDRESS,
    },
  })

  await rfps.forEach(async (rfp: Rfp) => {
    await db.rfp.update({
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
          singleTokenGate: {
            token: {
              chainId: 1,
              address: "0x55256178aFE74082c4f9aFEF7E40fec949c1b499",
              type: TokenType.ERC721,
              name: "Philosophical Foxes",
              symbol: "FOX",
            },
            minBalance: "1",
          },
        },
      },
    })
  })

  // const count = await db.$transaction(
  //   rfps.map((rfp) =>
  //     db.rfp.update({
  //       where: {
  //         id: rfp.id,
  //       },
  //       data: {
  //         data: {
  //           ...Object(rfp.data),
  //           singleTokenGate: {
  //             token: {
  //               chainId: 1,
  //               address: "0x55256178aFE74082c4f9aFEF7E40fec949c1b499",
  //               type: TokenType.ERC721,
  //               name: "Philosophical Foxes",
  //               symbol: "FOX",
  //             },
  //           },
  //         },
  //       },
  //     })
  //   )
  // )

  console.log(rfps.length + " rfps updated for Foxes")
}

export default seed
