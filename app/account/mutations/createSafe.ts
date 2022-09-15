import db, { AddressType } from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { Account } from "../types"
import truncateString from "app/core/utils/truncateString"
import { AccountAccountType } from "@prisma/client"

const CreateSafe = z.object({
  address: z.string(),
  chainId: z.number(),
})

const gnosisUrlForChain = {
  1: "https://safe-transaction.gnosis.io",
  4: "https://safe-transaction.rinkeby.gnosis.io",
  5: "https://safe-transaction.goerli.gnosis.io",
}

export default async function createSafe(input: z.infer<typeof CreateSafe>, ctx: Ctx) {
  const params = CreateSafe.parse(input)

  let addressType = AddressType.SAFE
  let multisigChainId = params.chainId
  const name = truncateString(params.address)

  const gnosisApiUrl = gnosisUrlForChain[params.chainId]
  const response = await fetch(`${gnosisApiUrl}/api/v1/safes/${params.address}`)
  const data = await response.json()
  const owners = data.owners

  const payload = {
    address: params.address,
    addressType,
    data: {
      name: name,
      chainId: multisigChainId,
    },
    targetsOf: {
      connectOrCreate: owners.map((owner) => {
        return {
          where: { address: owner },
          create: { address: owner },
        }
      }),
    },
  }

  // create or connect each owner
  const account = await db.account.create({
    data: {
      address: params.address,
      addressType,
      data: {
        name: name,
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
