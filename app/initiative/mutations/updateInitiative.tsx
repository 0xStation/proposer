import db from "db"
import * as z from "zod"
import { Initiative } from "../types"

const formatErrorMessage = (formattedError) => {
  let errorMessage = "failed to update initiative -"
  Object.keys(formattedError).forEach((field) => {
    if (field === "_errors") return
    errorMessage = errorMessage.concat(
      "\n",
      `${field}: ${JSON.stringify(formattedError[field]._errors)}`
    )
  })
  return errorMessage
}

const UpdateInitiative = z.object({
  about: z.any(),
  bannerURL: z.string(),
  commitment: z.string(),
  existingSkills: z
    .object({
      value: z.string(),
      label: z.string(),
      id: z.number(),
    })
    .array(),
  id: z.number(),
  isAcceptingApplications: z.boolean(),
  links: z
    .object({
      url: z.string(),
      symbol: z.number(),
    })
    .array()
    .optional(),
  link: z.string().optional(),
  name: z.string(),
  oneLiner: z.string(),
  rewardText: z.union([z.string(), z.string().array()]),
  skills: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .array(),
  status: z.object({
    value: z.string(),
    label: z.string(),
  }),
})

export default async function updateInitiative(input: z.infer<typeof UpdateInitiative>) {
  const response = UpdateInitiative.safeParse(input)

  if (!response.success) {
    const formattedError = response.error?.format()
    const message = formatErrorMessage(formattedError)
    throw new Error(message)
  }

  const params = response.data
  const existingInitiative = await db.initiative.findUnique({
    where: { id: params.id },
  })

  if (!existingInitiative) {
    throw new Error("cannot update an initiative that does not exist")
  }

  const existingSkillValues = params.existingSkills.map((skill) => skill.value)
  const incomingSkillValues = params.skills.map((skill) => skill.value)

  const newSkills = params.skills.filter((skill) => !existingSkillValues.includes(skill.value))
  const removedSkills = params.existingSkills.filter(
    (skill) => !incomingSkillValues.includes(skill.value)
  )

  const payload = {
    data: {
      about: params.about,
      bannerURL: params.bannerURL,
      commitment: params.commitment,
      isAcceptingApplications: params.isAcceptingApplications,
      links: params.links,
      link: params.link,
      name: params.name,
      oneLiner: params.oneLiner,
      rewardText: params.rewardText,
      status: params.status.value,
    },
    skills: {
      delete: removedSkills.map((skill) => {
        return {
          initiativeId_skillId: {
            initiativeId: params.id,
            skillId: skill.id,
          },
        }
      }),
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

  const initiative = await db.initiative.update({
    where: {
      id: params.id,
    },
    data: payload,
  })
  return initiative as Initiative
}
