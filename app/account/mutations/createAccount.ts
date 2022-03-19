import db from "db"
import * as z from "zod"
import { Account } from "../types"

const CreateAccount = z.object({
  name: z.string(),
  bio: z.string(),
  contactURL: z.string(),
  timezone: z.string(),
  skills: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .array(),
  address: z.string(),
  pfpURL: z.string().optional(),
  coverURL: z.string().optional(),
  discordId: z.string().optional(),
  ens: z.string().optional(),
  verified: z.string().optional(),
})

export default async function createAccount(input: z.infer<typeof CreateAccount>) {
  const params = CreateAccount.parse(input)

  const payload = {
    address: params.address,
    data: {
      bio: params.bio,
      contactURL: params.contactURL,
      timezone: params.timezone,
      pfpURL: params.pfpURL,
      coverURL: params.coverURL,
      name: params.name,
      discordId: params.discordId,
      ens: params.ens,
      verified: params.verified,
    },
    skills: {
      create: params.skills.map((skill) => {
        return {
          skill: {
            connectOrCreate: {
              where: {
                name: skill.value.toLowerCase(),
              },
              create: {
                name: skill.value.toLowerCase(),
              },
            },
          },
        }
      }),
    },
  }

  const account = await db.account.create({
    data: payload,
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  })

  return account as Account
}
