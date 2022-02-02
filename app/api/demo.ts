import type { NextApiRequest, NextApiResponse } from "next"
import aws from "aws-sdk"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const s3 = new aws.S3({
    endpoint: process.env.SPACES_ENDPOINT,
    accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SPACES_SECRET_KEY,
  })

  s3.upload({
    Bucket: "station-images",
    ACL: "public-read",
    Key: "test",
    Body: "<svg></svg>",
    ContentType: "image/svg+xml",
  }).send((err, data) => {
    if (err) {
      res.json({
        error: err,
      })
    }
    if (data) {
      res.json({
        url: data.Location,
      })
    }
  })
}
