import db from "db"
import { api } from "app/blitz-server"
import { NextApiRequest, NextApiResponse } from "next"

export default api(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { checkId } = req.query
    const check = await db.check.findUnique({
      where: {
        id: checkId as string,
      },
      include: {
        checkbook: true,
      },
    })
    res.status(200).json({ check })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      response: "error",
      message: `Failed with error: ${err}`,
    })
  }
})
