import db, { AddressType } from "db"
import { AccountAccountType } from "@prisma/client"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import networks from "app/utils/networks.json"
import { AccountMetadata } from "app/account/types"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import axios from "axios"

// To run:
// blitz db seed -f db/scripts/pin-safes.ts
const seed = async () => {
  const safes = await db.account.findMany({
    where: {
      addressType: AddressType.SAFE,
    },
  })

  safes.forEach(async (safe) => {
    const network = networks[(safe.data as AccountMetadata).chainId || 0]?.gnosisNetwork

    const url = `https://safe-transaction.${network}.gnosis.io/api/v1/safes/${toChecksumAddress(
      safe.address || ""
    )}`

    const response = await axios.get(url)

    response.data.owners.forEach(async (owner) => {
      const res = await db.accountAccount.upsert({
        where: {
          originAddress_targetAddress_type: {
            originAddress: owner,
            targetAddress: safe.address || "",
            type: AccountAccountType.PIN_WORKSPACE,
          },
        },
        update: {},
        create: {
          targetAccount: {
            connect: {
              address: safe.address || "",
            },
          },
          originAccount: {
            connectOrCreate: {
              where: { address: owner },
              create: { address: owner }, // WARNING, does not check if account is safe or not!
            },
          },
          type: AccountAccountType.PIN_WORKSPACE,
          data: {},
        },
      })
    })
  })
}

export default seed
