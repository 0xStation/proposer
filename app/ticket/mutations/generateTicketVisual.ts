import db from "db"
import * as z from "zod"
import { Account } from "app/account/types"

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

  let base64EncodedNFT = await fetch("http://localhost:3000/api/nft/ticket", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      name: params.accountName,
      role: params.roleName,
      terminal: params.terminalName,
      gradientColor: 1,
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      return json.encoded
    })

  const updatedAccount = await db.account.update({
    where: { address: params.accountAddress },
    data: { data: { ...(existingAccount.data as {}), image: base64EncodedNFT } },
  })

  // ^^^ note on the above
  // Spread types may only be created from object types.
  // existingAccount.data is of type Prisma.JsonValue which _is_ an object
  // but for some reason TS doesn't think so, hence the `as {}`

  return updatedAccount as Account
}
