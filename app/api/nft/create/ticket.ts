import type { NextApiRequest, NextApiResponse } from "next"
import { genSVG } from "app/ticket/svg"

type Data = {
  encoded: string | undefined
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  let props = {
    gradientColor: req.body.gradientColor,
    name: req.body.name,
    role: req.body.role,
    terminal: req.body.terminal,
  }

  let nft = genSVG(props)
  // let encoded = nft ? Buffer.from(nft).toString("base64") : ""
  // res.status(200).json({ encoded })

  res.status(200).json({ encoded: nft })
}
