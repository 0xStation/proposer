import db, { AddressType } from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { Account } from "../types"
import truncateString from "app/core/utils/truncateString"
import { AccountAccountType } from "@prisma/client"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import networks from "app/utils/networks.json"

const CreateSafe = z.object({
  address: z.string(),
  chainId: z.number(),
})

export default async function createSafe(input: z.infer<typeof CreateSafe>, ctx: Ctx) {
  const params = CreateSafe.parse(input)

  const multisigChainId = params.chainId
  const network = networks[params.chainId]?.gnosisNetwork

  const url = `https://safe-transaction.${network}.gnosis.io/api/v1/safes/${toChecksumAddress(
    params.address
  )}`

  const response = await fetch(url)

  // catch error from API call to gnosis.
  // Todo: could be less ambiguous than "something went wrong" :-p
  if (response.status !== 200) {
    throw new Error("something went wrong!")
  }

  const { owners } = await response.json()

  // create or connect each owner
  // upsert to prevent throwing if safe already exists
  const account = await db.account.upsert({
    where: { address: params.address },
    update: {},
    create: {
      address: params.address,
      addressType: AddressType.SAFE,
      data: {
        chainId: multisigChainId,
      },
      targetsOf: {
        create: owners.map((owner) => {
          return {
            originAccount: {
              connectOrCreate: {
                where: { address: owner },
                create: { address: owner },
              },
            },
            type: AccountAccountType.PIN_WORKSPACE,
            data: {},
          }
        }),
      },
    },
  })

  return account as Account
}
