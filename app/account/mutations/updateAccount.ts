import db from "db"
import * as z from "zod"
import { Account } from "../types"

const UpdateAccount = z.object({
  address: z.string(),
  name: z.string().optional(),
  bio: z.string().optional(),
  contactURL: z.string().optional(),
  timezone: z.string().optional(),
  skills: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .array(),
  existingSkills: z
    .object({
      value: z.string(),
      label: z.string(),
      id: z.number(),
    })
    .array(),
  pfpURL: z.string().optional(),
  coverURL: z.string().optional(),
})

export default async function updateAccount(input: z.infer<typeof UpdateAccount>) {
  const params = UpdateAccount.parse(input)

  const payload = {
    address: params.address,
    data: {
      bio: params.bio,
      contactURL: params.contactURL,
      timezone: params.timezone,
      pfpURL: params.pfpURL,
      coverURL: params.coverURL,
      name: params.name,
    },
    // skills: {
    //   create: newSkills.map((skill) => {
    //     if (params.existingSkills.includes(skill)) {
    //       return {
    //         skill: {
    //           set: { id: skill.id },
    //         },
    //       }
    //     }
    //     return {
    //       skill: {
    //         connectOrCreate: {
    //           where: {
    //             name: skill.value.toLowerCase(),
    //           },
    //           create: {
    //             name: skill.value.toLowerCase(),
    //           },
    //         },
    //       },
    //     }
    //   }),
    // },
  }

  const account = await db.account.update({
    where: {
      address: params.address,
    },
    data: payload,
  })
  return account as Account
}
