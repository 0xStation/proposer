import { api } from "app/blitz-server"
import { NextApiRequest, NextApiResponse } from "next"
import { Novu } from "@novu/node"

type Notification = {
  type: string
  subscriberId: string
  payload: any
}

const novu = new Novu(process.env.NEXT_PUBLIC_NOVU_API_KEY || "")

export default api(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const notificationData = req.body as Notification

  try {
    novu.trigger(notificationData.type, {
      to: { subscriberId: notificationData.subscriberId },
      payload: notificationData.payload,
    })
  } catch (e: any) {
    console.error(e)
    throw e
  }

  res.statusCode = 200
  res.end()
})
