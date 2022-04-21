import { toChecksumAddress } from "app/core/utils/checksumAddress"

// DOES NOT ACTUALLY SEED ANYTHING
// USED TO LOG DISCORD HANDLES FROM PRODUCTION DATABASE TO COPY TO A LOCAL CSV
// This seed function is executed when you run `blitz db seed -f db/query.ts`
const seed = async () => {
  const address = "0x33e3a9610d7d0847a68109ba1b2d00089a784d21"
  const checksummed = toChecksumAddress(address)
  console.log(`old: ${address}`)
  console.log(`new: ${checksummed}`)
}

export default seed
