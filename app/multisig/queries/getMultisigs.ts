import { AddressType } from "@prisma/client"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import * as z from "zod"

const GetMultisigs = z.object({
  multisigs: z
    .object({
      chainId: z.number(),
      address: z.string(),
      type: z.enum([AddressType.SAFE, AddressType.CHECKBOOK]),
    })
    .array(),
})

export default async function getMultisigs(input: z.infer<typeof GetMultisigs>) {
  const params = GetMultisigs.parse(input)

  const requests: any[] = []

  params.multisigs.forEach(async (multisig) => {
    if (multisig.type === AddressType.SAFE) {
      requests.push(getGnosisSafeDetails(multisig.chainId, multisig.address))
    }
  })

  const responses = await Promise.all(requests)

  return responses.filter((data) => !!data)
}
