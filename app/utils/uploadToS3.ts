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
  ContentType?: string
}

const OPTION_DEFAULTS = {
  Bucket: "station-images",
  ACL: "public-read",
  ContentType: "image/svg+xml",
}

// General function for uploading assets to Digital Ocean
// We use the "aws-sdk" library which works with digital ocean, but all of the functions
// are centered around AWS (S3 etc), so just keep that in mind. We are really on DO.
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
