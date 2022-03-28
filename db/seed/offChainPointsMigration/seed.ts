import getSubgraphApplicationData from "app/application/queries/getSubgraphApplicationData"
import { Application, ApplicationSubgraphData } from "app/application/types"
import createEndorsement from "app/endorsements/mutations/createEndorsement"
import { Terminal } from "app/terminal/types"

import db from "db"

const terminals = ["stationlabs", "ccs"]

// 1. iterate over terminals to grab
//    - terminal id
//    - initiatives per terminal
//    - referral graph address
// 2. iterate over initiatives to grab
//    - initiatve id
//    - applications
// 3. iterate over applications to
//    - fetch subgraph data (all points + referrals) using terminal id, initiative id, referral graph address
//    - create off-chain endorsements using points, referral, account on application
export const seed = async () => {
  // iterate over terminals
  for (const idx in terminals) {
    const handle = terminals[idx]
    const terminal = (await db.terminal.findUnique({
      where: {
        handle: handle as string,
      },
      include: {
        initiatives: true,
      },
    })) as Terminal

    if (!terminal) {
      console.error(`Terminal ${handle} not found`)
      continue
    }

    console.log(`Running seed for terminal:`, terminal.data.name)

    const referralGraphAddress = terminal?.data.contracts.addresses.referrals
    const { initiatives = [], id: terminalId } = terminal as Terminal

    // iterate over initiatives
    initiatives.map(async (initiative) => {
      const applications = (await db.accountInitiative.findMany({
        where: { initiativeId: initiative.id as number, status: "APPLIED" },
        include: {
          account: true,
        },
      })) as unknown as Application[]

      if (!applications) {
        console.log("No applications found for initiative id", initiative.id)
        return
      }

      // iterate over applications
      applications?.map(async (application) => {
        const { account } = application
        const { data: accountData } = account

        const subgraphData = (await getSubgraphApplicationData({
          referralGraphAddress,
          initiativeLocalId: initiative.localId,
          terminalId,
          address: account?.address,
        })) as ApplicationSubgraphData

        if (!Object.keys(subgraphData).length) {
          console.log(
            `No subgraph data found for ${accountData?.name as string}, skipping migration.`
          )
          return
        }

        console.log(`Subgraph data for ${accountData?.name as string}: `, subgraphData)
        subgraphData.referrals.map(async ({ from, amount }) => {
          const endorsement = await createEndorsement({
            initiativeId: initiative?.id,
            endorseeId: account.id,
            endorserId: from?.id,
            endorsementValue: ((amount as number) / 1000000) as number,
          })

          console.log(
            `Successfully created off-chain endorsement for ${account.data.name}`,
            endorsement
          )
        })
      })
    })
  }
}

export default seed
