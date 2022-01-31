import db from "db"
import * as z from "zod"
import { request, gql } from "graphql-request"
import { getWalletString } from "app/utils/getWalletString"
import { Application, ApplicationMetadata, ApplicationReferral } from "../types"

const GetApplicationsByInitiative = z.object({
  referralGraphAddress: z.string(),
  initiativeLocalId: z.number(),
  initiativeId: z.number(),
})

export default async function getApplicationsByInitiative(
  input: z.infer<typeof GetApplicationsByInitiative>
) {
  const data = GetApplicationsByInitiative.parse(input)
  const { referralGraphAddress, initiativeLocalId, initiativeId } = data

  //////
  // Query subgraph for initiative-level referral data
  //////

  let queryWaitingRoom = gql`
    {
      waitingRoomInitiative(id: "${referralGraphAddress.toLowerCase()}:${initiativeLocalId}.0") {
        localId
        applicants {
          address
          points
          referrals {
            from
            amount
          }
        }
      }
    }
  `
  let subgraphQuery = await request(
    "https://api.thegraph.com/subgraphs/name/0xstation/station",
    queryWaitingRoom
  )

  // per-applicant info about points received and associated referrerals
  const applicants = {}
  // per-referrer store for account metadata
  const referrers = {}

  if (subgraphQuery.waitingRoomInitiative) {
    //////
    // Construct objects for applicants and referrers to merge with db data
    //////

    subgraphQuery.waitingRoomInitiative.applicants.forEach((a) => {
      applicants[a.address] = a
      a.referrals.forEach((r) => {
        // default data, will be overriden if account with address r.from exists later
        referrers[r.from] = {
          data: {
            name: getWalletString(r.from),
            wallet: getWalletString(r.from),
            address: r.from,
            pfpURL:
              "https://user-images.githubusercontent.com/38736612/151722561-ba3b7d89-cb9f-4ad2-86de-73ff3dc3d286.png",
            verified: false,
            pronouns: "",
            role: "N/A",
          },
        }
      })
    })

    //////
    // Merge db account data with subgraph referrers
    //////

    if (Object.keys(referrers).length > 0) {
      // fetch metadata from accounts matching referrer addresses
      const accounts = await db.account.findMany({
        where: { address: { in: Object.keys(referrers) } },
        select: { address: true, data: true },
      })
      // update per-referrer store with account metadata
      accounts.forEach((r) => (referrers[r.address].data = r.data))
    }
  }

  //////
  // Merge db initiative application data with sugraph referrals
  //////

  // get all applications for the initiative
  const applications = await db.initiativeApplication.findMany({
    where: { initiativeId: initiativeId },
    include: { applicant: true },
  })

  // merge database data and subgraph data
  const merged =
    applications?.map((a) => {
      const applicant = applicants[a.applicant.address.toLowerCase()]
      return {
        ...a,
        data: a.data as ApplicationMetadata,
        points: (applicant?.points as number) || 0,
        referrals:
          (applicant?.referrals.map((r) => {
            return {
              amount: r.amount,
              from: referrers[r.from],
            }
          }) as ApplicationReferral[]) || [],
      }
    }) || []

  return merged as unknown as Application[]
}
