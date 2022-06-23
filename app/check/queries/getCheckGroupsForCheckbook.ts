import db from "db"
import * as z from "zod"

const GetCheckGroupsForCheckbook = z.object({
  address: z.string(),
})

export default async function getCheckGroupsForCheckbook(
  input: z.infer<typeof GetCheckGroupsForCheckbook>
) {
  console.log("get check groups")

  const checks = await db.check.groupBy({
    where: {
      fundingAddress: input.address,
    },
    by: ["txnHash"],
    _sum: {
      tokenAmount: true,
    },
  })

  console.log(checks)
  return checks
}
