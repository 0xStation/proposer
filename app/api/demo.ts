import type { NextApiRequest, NextApiResponse } from "next"
import aws from "aws-sdk"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const s3 = new aws.S3({
    endpoint: process.env.SPACES_ENDPOINT,
    accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SPACES_SECRET_KEY,
  })

  console.log("just trying to view the processes")
  res.json({
    s3: s3,
  })
}
