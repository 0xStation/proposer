import { AccountMetadata } from "app/account/types"
import db from "./index"

interface Seed {
  address: string
  pfpURL: string
}

const conner = {
  address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
  pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/symmetry-square-small.jpg",
}

export default async function seed() {
  const contributorSeed = conner

  const account = await db.account.findUnique({
    where: { address: contributorSeed.address },
  })

  const updated = await db.account.update({
    where: {
      address: contributorSeed.address,
    },
    data: {
      data: {
        ...(account?.data as AccountMetadata),
        pfpURL: contributorSeed.pfpURL,
      },
    },
  })

  console.log("account pfp updated", updated)
}
