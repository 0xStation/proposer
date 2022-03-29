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
  bannerURL: z.string(),
  commitment: z.string().optional(),
  contributeText: z.union([z.string(), z.string().array()]).optional(),
  id: z.number(),
  isAcceptingApplications: z.boolean(),
  links: z
    .object({
      url: z.string(),
      symbol: z.number(),
    })
    .array()
    .optional(),
  name: z.string(),
  oneLiner: z.string(),
  rewardText: z.union([z.string(), z.string().array()]),
  skills: z.string().array(),
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

  const payload = {
    data: {
      bannerURL: params.bannerURL,
      commitment: params.commitment,
      contributeText: params.contributeText,
      isAcceptingApplications: params.isAcceptingApplications,
      links: params.links,
      name: params.name,
      oneLiner: params.oneLiner,
      rewardText: params.rewardText,
      skills: params.skills,
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
