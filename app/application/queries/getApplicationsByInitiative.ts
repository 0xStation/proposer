import db from "db"
import * as z from "zod"
import { request, gql } from "graphql-request"
import { getWalletString } from "app/utils/getWalletString"
import { Application, ApplicationMetadata, ApplicationReferral } from "../types"
import { Role } from "app/role/types"

const GetApplicationsByInitiative = z.object({
  referralGraphAddress: z.string(),
  initiativeLocalId: z.number(),
  initiativeId: z.number(),
  terminalId: z.number(),
})

export default async function getApplicationsByInitiative(
  input: z.infer<typeof GetApplicationsByInitiative>
) {
  const data = GetApplicationsByInitiative.parse(input)
  const { referralGraphAddress, initiativeLocalId, initiativeId, terminalId } = data

  //////
  // Query subgraph for initiative-level referral data
  //////

  let queryWaitingRoom = gql`
    {
      waitingRoomInitiative(id: "${referralGraphAddress.toLowerCase()}:${initiativeLocalId}") {
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
      applicants[a.address.toLowerCase()] = a
      a.referrals.forEach((r) => {
        // default data, will be overriden if account with address r.from exists later
        referrers[r.from.toLowerCase()] = {
          address: r.from,
          role: "N/A",
          data: {
            name: getWalletString(r.from),
            wallet: getWalletString(r.from),
            address: r.from,
            pfpURL:
              "https://user-images.githubusercontent.com/38736612/151722561-ba3b7d89-cb9f-4ad2-86de-73ff3dc3d286.png",
            verified: false,
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
        where: { address: { in: Object.keys(referrers), mode: "insensitive" } },
        // addresses come from the subgraph lowered, but database may or may not lower so insensitive filtering used
        select: {
          address: true,
          data: true,
          tickets: {
            where: {
              terminalId: terminalId,
            },
            select: {
              role: true,
            },
          },
        },
      })
      // update per-referrer store with account metadata
      accounts.forEach((a) => {
        referrers[a.address.toLowerCase()].address = a.address
        referrers[a.address.toLowerCase()].data = a.data
        referrers[a.address.toLowerCase()].role = (a.tickets[0]?.role as Role)?.data.value || "N/A"
      })
    }
    //////
    // Merge db initiative application data with sugraph referrals
    //////
  }

  // get all applications for the initiative
  const applications = await db.accountInitiative.findMany({
    where: { initiativeId: initiativeId, status: "APPLIED" },
    include: {
      account: {
        include: {
          tickets: {
            where: {
              terminalId: data.terminalId,
            },
            include: {
              role: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
        },
      },
    },
  })

  // merge database data and subgraph data
  const merged =
    applications?.map((a) => {
      const applicant = applicants[a.account.address.toLowerCase()]
      return {
        account: {
          ...a.account,
          role: (a.account.tickets[0]?.role as Role)?.data.value || "N/A",
          skills: a.account.skills.map(({ skill }) => skill.name),
        },
        createdAt: a.createdAt,
        data: a.data as ApplicationMetadata,
        points: parseFloat(applicant?.points || "0"),
        referrals:
          (applicant?.referrals.map((r) => {
            return {
              amount: r.amount,
              from: {
                address: referrers[r.from.toLowerCase()].address,
                data: referrers[r.from.toLowerCase()].data,
                role: referrers[r.from.toLowerCase()].role,
              },
            }
          }) as ApplicationReferral[]) || [],
      }
    }) || []

  return merged as unknown as Application[]
}
