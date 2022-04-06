import db from "../../index"

type ApplicationMetadata = {
  entryDescription?: string
  url?: string
  urls?: string[]
}

type Application = {
  accountId: number
  initiativeId: number
  data: ApplicationMetadata
}

// blitz db seed -f db/scripts/populate-application-urls.ts
const seed = async () => {
  const applications = (await db.accountInitiative.findMany()) as Application[]

  for (let i in applications) {
    let application = applications[i]

    if (!application) {
      continue
    }

    const url = application?.data?.url

    if (url) {
      await db.accountInitiative.update({
        where: {
          accountId_initiativeId: {
            accountId: application.accountId,
            initiativeId: application.initiativeId,
          },
        },
        data: {
          data: {
            ...application.data,
            urls: [url],
          },
        },
      })
    }
  }
}

export default seed
