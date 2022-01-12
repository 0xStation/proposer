import aws from "aws-sdk"

type UploadResponse = {
  ETag?: string
  Location?: string
  key?: string
  Key?: string
  Bucket?: string
}

type UploadOptions = {
  Bucket?: string
  ACL?: string
}

const OPTION_DEFAULTS = {
  Bucket: "station",
  ACL: "public-read",
}

function uploadToS3(content, path, options: UploadOptions = {}): Promise<UploadResponse> {
  const s3 = new aws.S3({
    endpoint: process.env.SPACES_ENDPOINT,
    accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SPACES_SECRET_KEY,
  })

  return new Promise((resolve) => {
    s3.upload(Object.assign({ Key: path, Body: content }, OPTION_DEFAULTS, options)).send(
      (err, data) => {
        if (err) console.log(err)
        resolve(data)
      }
    )
  })
}

export default uploadToS3
