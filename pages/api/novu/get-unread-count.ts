import { api } from "app/blitz-server"
import { NextApiRequest, NextApiResponse } from "next"

export default api(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { subscriberId } = req.query

  try {
    const response = await fetch(
      `https://api.novu.co/v1/subscribers/${subscriberId}/notifications/unseen`,
      {
        method: "GET",
        headers: {
          Authorization: `ApiKey ${process.env.NEXT_PUBLIC_NOVU_API_KEY}`,
        },
      }
    )

    const data = await response.json()

    res.statusCode = 200
    res.json(data.data)
    return
  } catch (e: any) {
    console.log("this is the error")
    console.error(e)
    throw e
  }
})
