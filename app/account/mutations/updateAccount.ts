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

  const existingSkillValues = params.existingSkills.map((skill) => skill.value)
  const incomingSkillValues = params.skills.map((skill) => skill.value)

  const newSkills = params.skills.filter((skill) => !existingSkillValues.includes(skill.value))
  const removedSkills = params.existingSkills.filter(
    (skill) => !incomingSkillValues.includes(skill.value)
  )

  const existingAccount = await db.account.findUnique({
    where: {
      address: params.address,
    },
  })

  if (!existingAccount) {
    console.log("cannot update an account that does not exist")
    return null
  }

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
    skills: {
      delete: removedSkills.map((skill) => {
        return {
          accountId_skillId: {
            accountId: existingAccount.id,
            skillId: skill.id,
          },
        }
      }),
      // delete: [
      //   {
      //     accountId_skillId: {
      //       accountId: 20,
      //       skillId: 3,
      //     },
      //   },
      // ],
      create: newSkills.map((skill) => {
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

  const account = await db.account.update({
    where: {
      address: params.address,
    },
    data: payload,
  })
  return account as Account
}
