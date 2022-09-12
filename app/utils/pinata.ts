import * as z from "zod"
import axios from "axios"
import { requireEnv } from "./requireEnv"

const pinataApiEndpoint = requireEnv("NEXT_PUBLIC_PINATA_API_ENDPOINT_URL")
const pinantaJwt = requireEnv("PINATA_JWT")

const PinataRequest = z.object({
  pinataOptions: z.object({ cidVersion: z.number(), wrapWithDirectory: z.boolean().optional() }),
  pinataMetadata: z.any(),
  pinataContent: z.any(),
})

// Pinata api here: https://docs.pinata.cloud/pinata-api/pinning/pin-json
// pass in the config
// {
//   pinataOptions: {
//     cidVersion: 1
//   },
//   pinataMetadata: {
//     name: testing,
//     keyvalues: {
//       customKey: customValue,
//       customKey2: customValue2
//     }
//   },
//   pinataContent: {
//     somekey: somevalue
//   }
// }
export const pinJsonToPinata = async (input: z.infer<typeof PinataRequest>) => {
  let data
  try {
    data = PinataRequest.parse(input)
  } catch (err) {
    console.error("Failed to parse inputs on pinJsonToIpfs. Failed with error:", err)
    return null
  }

  const config = {
    headers: {
      "Content-Type": `application/json`,
      Authorization: `Bearer ${pinantaJwt}`,
    },
  }

  const body = JSON.stringify(data)

  let response
  try {
    response = await axios.post(pinataApiEndpoint, body, config)
  } catch (err) {
    console.error("Error thrown from pinata via pinJsonToIpfs. Failed with error:", err)
    return null
  }

  return response.data
}

export default pinJsonToPinata
