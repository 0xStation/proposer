import type { NextApiRequest, NextApiResponse } from "next"
import { genSVG } from "app/ticket/svg"

type Data = {
  svg: string
}

type Error = {
  error: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data | Error>) {
  let props = {
    name: req.body.name,
    role: req.body.role,
    terminal: req.body.terminal,
  }

  let nft = genSVG(props)

  if (!nft) {
    res.status(500).json({ error: "something went wrong generating the nft." })
    return
  }

  res.status(200).json({ svg: nft })
}
