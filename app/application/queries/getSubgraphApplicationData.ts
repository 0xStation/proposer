import db from "db"
import * as z from "zod"
import { request, gql } from "graphql-request"
import { getWalletString } from "app/utils/getWalletString"
import { ApplicationReferral, ApplicationSubgraphData } from "../types"
import { Role } from "app/role/types"

const GetSubgraphApplicationData = z.object({
  referralGraphAddress: z.string(),
  initiativeLocalId: z.number(),
  terminalId: z.number(),
  address: z.string(),
})

export default async function getSubgraphApplicationData(
  input: z.infer<typeof GetSubgraphApplicationData>
) {
  const data = GetSubgraphApplicationData.parse(input)

  //////
  // Query subgraph for initiative-level referral data
  //////

  const queryWaitingRoom = gql`
    {
      waitingRoomInitiative(id: "${data.referralGraphAddress.toLowerCase()}:${
    data.initiativeLocalId
  }") {
        localId
        applicants(where: {address: "${data.address.toLowerCase()}"}) {
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
  const subgraphPayload = await request(
    "https://api.thegraph.com/subgraphs/name/0xstation/station",
    queryWaitingRoom
  )

  if (
    !subgraphPayload?.waitingRoomInitiative ||
    !Array.isArray(subgraphPayload?.waitingRoomInitiative?.applicants) ||
    !subgraphPayload?.waitingRoomInitiative?.applicants?.length
  ) {
    console.warn(
      `Log: no subgraph data found for account address ${
        data.address
      }, payload returned with ${JSON.stringify(subgraphPayload)}`
    )
    return {}
  }

  //////
  // Construct objects for applicants and referrers to merge with db data
  //////
  const applicantData = subgraphPayload.waitingRoomInitiative.applicants[0]

  // per-referrer store for account metadata
  const referrers = {}
  applicantData?.referrals?.forEach((referral) => {
    // default data, will be overriden if account with address r.from exists later
    referrers[referral.from.toLowerCase()] = {
      address: referral.from,
      role: "N/A",
      data: {
        name: getWalletString(referral.from),
        wallet: getWalletString(referral.from),
        address: referral.from,
        pfpURL: "",
        verified: false,
      },
    }
  })

  //////
  // Merge db account data with subgraph referrers
  //////

  if (Object.keys(referrers).length > 0) {
    // fetch metadata from accounts matching referrer addresses
    const accounts = await db.account.findMany({
      where: { address: { in: Object.keys(referrers), mode: "insensitive" } },
      // addresses come from the subgraph lowered, but database may or may not lower so insensitive filtering used
      select: {
        id: true,
        address: true,
        data: true,
        tickets: {
          where: {
            terminalId: data.terminalId,
          },
          select: {
            role: true,
          },
        },
      },
    })
    // update per-referrer store with account metadata
    accounts.forEach((a) => {
      referrers[a.address.toLowerCase()].id = a.id
      referrers[a.address.toLowerCase()].address = a.address
      referrers[a.address.toLowerCase()].role = (a.tickets[0]?.role as Role)?.data.value || "N/A"
      referrers[a.address.toLowerCase()].data = a.data
    })
  }

  return {
    points: parseFloat(applicantData?.points || "0"),
    referrals:
      (applicantData?.referrals.map((referral) => {
        return {
          amount: referral.amount,
          from: JSON.parse(JSON.stringify(referrers[referral.from.toLowerCase()])),
        }
      }) as ApplicationReferral[]) || [],
  } as ApplicationSubgraphData
}
