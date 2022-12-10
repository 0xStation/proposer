import { api } from "app/blitz-server"
import { NextApiRequest, NextApiResponse } from "next"

export default api(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { subscriberId, notificationId } = req.query

  try {
    const response = await fetch(
      `https://api.novu.co/v1/subscribers/${subscriberId}/messages/${notificationId}/seen`,
      {
        method: "POST",
        headers: {
          Authorization: `ApiKey ${process.env.NEXT_PUBLIC_NOVU_API_KEY}`,
        },
      }
    )

    const data = await response.json()
    console.log(data)

    res.statusCode = 200
    res.json(data.data)
    return
  } catch (e: any) {
    console.error(e)
    throw e
  }
})
