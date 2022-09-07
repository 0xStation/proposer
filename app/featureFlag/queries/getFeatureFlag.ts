import db from "db"
import { z } from "zod"
import { FeatureFlagStatus } from "app/core/utils/constants"

const GetFeatureFlag = z.object({
  key: z.string(),
})

export async function getFeatureFlag(input: z.infer<typeof GetFeatureFlag>) {
  const params = GetFeatureFlag.parse(input)
  const flag = await db.featureFlag.findUnique({
    where: { key: params.key },
  })

  if (!flag) {
    console.error("this is not a valid feature flag key.")
  }

  return flag?.status === FeatureFlagStatus.ON
}

export default getFeatureFlag
