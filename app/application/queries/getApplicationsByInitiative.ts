import db from "db"
import * as z from "zod"
import { Application } from "app/application/types"
import { request, gql } from "graphql-request"

const GetApplicationsByInitiative = z.object({
  initiativeId: z.number(),
})

export default async function getApplicationsByInitiative(
  input: z.infer<typeof GetApplicationsByInitiative>
) {
  const data = GetApplicationsByInitiative.parse(input)

  // let FETCH_WAITING_ROOM_ENDORSEMENTS = gql`
  //   {
  //     initiatives (where: {localId: "${data.initiativeId}"}) {
  //       endorsees {
  //         address
  //         totalEndorsed
  //         endorsements { # list of endorsement objects
  //           from # address
  //           amount
  //           timestamp
  //         }
  //       }
  //     }
  //   }
  // `

  // let endorsementData = await request(
  //   "https://thegraph.com/hosted-service/subgraph/0xstation/station",
  //   FETCH_WAITING_ROOM_ENDORSEMENTS
  // )

  const applications = await db.initiativeApplication.findMany({
    where: { initiativeId: data.initiativeId },
    include: { applicant: true },
  })
  if (!applications) {
    return []
  }

  return applications as Application[]
}
