import { BlitzApiRequest, BlitzApiResponse } from "blitz"
import * as z from "zod"
import axios from "axios"

const PinataRequest = z.object({
  data: z.string(),
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
export default async function handler(req: BlitzApiRequest, res: BlitzApiResponse) {
  let params
  try {
    params = PinataRequest.parse(req.body)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      response: "error",
      message: `Missing required parameter "data" on pinJsonToIpfs. Failed with error: ${err}`,
    })
  }

  const config = {
    headers: {
      "Content-Type": `application/json`,
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
  }

  const body = JSON.stringify(params.body)
  let response
  try {
    response = axios.post(process.env.NEXT_PUBLIC_PINATA_API_ENDPOINT_URL as string, body, config)
  } catch (err) {
    console.error("Failed with error: ", err)
    res.status(500).json({
      response: "error",
      message: `Error thrown from pinata via pinJsonToIpfs. Failed with error: ${err}`,
    })
  }

  res.status(200).json({ proposal: response.data })
}
