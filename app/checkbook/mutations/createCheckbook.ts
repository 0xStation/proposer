import db from "db"
import * as z from "zod"
import { TagType } from "app/tag/types"

const CreateCheckbook = z.object({
  terminalId: z.number(),
  address: z.string(),
  chainId: z.number(),
  name: z.string(),
  quorum: z.number(),
  signers: z.string().array(), // assumes sanitized
})

export default async function createCheckbook(input: z.infer<typeof CreateCheckbook>) {
  // create tag for checkbook
  // having a tag to represent a checkbook will let us associate accounts with it via AccounTerminalTag objects
  // this will help us keep role management consistent and shared for things like member directory filtering and permissions
  const checkbookTag = await db.tag.create({
    data: {
      terminalId: input.terminalId,
      value: input.name,
      active: true,
      type: TagType.CHECKBOOK_SIGNER,
      data: {
        address: input.address,
        chainId: input.chainId,
      },
    },
  })

  // create checkbook
  const checkbook = await db.checkbook.create({
    data: {
      terminalId: input.terminalId,
      address: input.address,
      chainId: input.chainId,
      name: input.name,
      data: {
        quorum: input.quorum,
        signers: input.signers,
        tagId: checkbookTag.id,
      },
    },
  })

  // create accounts for signers if they do not exist
  await db.account.createMany({
    skipDuplicates: true,
    data: input.signers.map((address) => {
      return {
        address,
        data: {
          name: address,
        },
      }
    }),
  })

  const accounts = await db.account.findMany({
    where: {
      address: {
        in: input.signers,
      },
    },
  })

  // create memberships for signers if they do not exist
  await db.accountTerminal.createMany({
    skipDuplicates: true,
    data: accounts.map((a) => {
      return {
        accountId: a.id,
        terminalId: input.terminalId,
        active: true,
      }
    }),
  })

  // create tags for signers and checkbook
  await db.accountTerminalTag.createMany({
    skipDuplicates: true,
    data: accounts.map((a) => {
      return {
        tagId: checkbookTag.id,
        ticketAccountId: a.id,
        ticketTerminalId: input.terminalId,
      }
    }),
  })

  return checkbook
}
