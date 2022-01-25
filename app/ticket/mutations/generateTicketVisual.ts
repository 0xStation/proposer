import db from "db"
import * as z from "zod"
import { Account } from "app/account/types"
import uploadToS3 from "app/utils/uploadToS3"
import { genSVG } from "app/ticket/svg"

const GenerateTicketVisual = z.object({
  accountAddress: z.string(),
  accountName: z.string(),
  terminalName: z.string(),
  roleName: z.string(),
})

export default async function generateTicketVisual(input: z.infer<typeof GenerateTicketVisual>) {
  const params = GenerateTicketVisual.parse(input)

  const existingAccount = await db.account.findUnique({ where: { address: params.accountAddress } })

  if (!existingAccount) {
    throw Error("cannot create a ticket for an account that does not exist.")
  }

  let props = {
    name: params.accountName,
    role: params.roleName,
    terminal: params.terminalName,
    gradientColor: 1,
  }

  // genSVG is a function that generates the SVG for our platform NFTs based on the given params
  let ticketSVG = genSVG(props)

  const path = `tickets/${params.terminalName}/${params.accountName}.svg`
  const uploadedImageResponse = await uploadToS3(ticketSVG, path)
  const uploadedImagePath = uploadedImageResponse.Location

  const updatedAccount = await db.account.update({
    where: { address: params.accountAddress },
    data: { data: { ...(existingAccount.data as {}), ticketImage: uploadedImagePath } },
  })

  // ^^^ note on the above
  // Spread types may only be created from object types.
  // existingAccount.data is of type Prisma.JsonValue which _is_ an object
  // but for some reason TS doesn't think so, hence the `as {}`

  return updatedAccount as Account
}
