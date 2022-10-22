import { api } from "app/blitz-server"
import type { NextApiRequest, NextApiResponse } from "next"
import formidable from "formidable-serverless"
import fs from "fs"
import aws from "aws-sdk"
import { v4 as uuidv4 } from "uuid"

// excuse my language here but WTF this is the dumbest thing ever lol
// I spent like an hour trying to figure out what was going wrong
// Still confusing to me tbh
// https://stackoverflow.com/questions/13398890/form-parse-method-is-not-invoking-in-node-js
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

export default api(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const s3 = new aws.S3({
    endpoint: process.env.SPACES_ENDPOINT,
    accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SPACES_SECRET_KEY,
  })

  const form = new formidable.IncomingForm()
  let pathnameUUID = uuidv4()

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      console.log(err)
      return res.status(500)
    }
    const file = fs.readFileSync(files.file.path)
    s3.upload({
      Bucket: "station-images",
      ACL: "public-read",
      Key: pathnameUUID,
      Body: file,
      ContentType: files.file.type,
    }).send((err, data) => {
      if (err) {
        console.log("err", err)
        return res.status(500)
      }
      if (data) {
        return res.json({
          url: data.Location,
        })
      }
    })
  })
})
