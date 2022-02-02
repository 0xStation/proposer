import db from "db"
import * as z from "zod"
import { Account } from "../types"

const CreateAccount = z.object({
  discordId: z.string(),
  pronouns: z.optional(z.string()),
  timezone: z.string(),
  skills: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .array(),
  address: z.string(),
  pfpURL: z.string(),
})

export default async function createAccount(input: z.infer<typeof CreateAccount>) {
  const params = CreateAccount.parse(input)

  const payload = {
    address: params.address,
    data: {
      discordId: params.discordId,
      pronouns: params.pronouns || "",
      timezone: params.timezone,
      pfpURL: params.pfpURL,
    },
    skills: {
      create: params.skills.map((skill) => {
        return {
          skill: {
            connectOrCreate: {
              where: {
                name: skill.value,
              },
              create: {
                name: skill.value,
              },
            },
          },
        }
      }),
    },
  }

  const account = await db.account.create({ data: payload })
  return account as Account
}
