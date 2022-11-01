import db, { AddressType } from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { Account } from "../types"
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
  const gnosisApi = networks[params.chainId]

  const url = `${gnosisApi}/api/v1/safes/${toChecksumAddress(params.address)}`

  const response = await fetch(url)

  // catch error from API call to gnosis.
  // Todo: could be less ambiguous than "something went wrong" :-p
  if (response.status !== 200) {
    throw new Error("something went wrong!")
  }

  const { owners }: { owners: string[] } = await response.json()

  const ownerAccounts = await db.account.findMany({
    where: {
      address: { in: owners },
    },
  })

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
        // Only create assocations with existing accounts.
        // cannot create new accounts here because would require determining the type of each
        // newly created account which is too high latency of an operation, especially if you
        // consider nesting of multisig signers.
        // Instead, we need to devise a way for accounts created after this multisig to automatically pin
        // the workspace if they are a signer.
        connectOrCreate: ownerAccounts.map((owner) => {
          return {
            where: {
              originAddress_targetAddress_type: {
                originAddress: owner.address,
                targetAddress: params.address,
                type: AccountAccountType.PIN_WORKSPACE,
              },
            },
            create: {
              originAddress: owner.address,
              type: AccountAccountType.PIN_WORKSPACE,
              data: {},
            },
          }
        }),
      },
    },
  })

  return account as Account
}
