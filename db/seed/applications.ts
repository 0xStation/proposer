import db from "../index"
import { ApplicationMetadata } from "app/application/types"

const applicant1: ApplicationMetadata & { id: number; accountId: number; initiativeId: number } = {
  id: 1,
  accountId: 1,
  initiativeId: 1,
  entryDescription: "hello world",
  url: "https://twitter.com/symmtry69",
}

const stationApplications = [applicant1]

export async function seedApplications() {
  for (const name in stationApplications) {
    const application = stationApplications[name]
    const ret = await db.accountInitiative.upsert({
      where: {
        accountId_initiativeId: {
          accountId: application?.accountId || 1,
          initiativeId: application?.initiativeId || 1,
        },
      },
      create: {
        accountId: application!.accountId,
        initiativeId: application!.initiativeId,
        data: application,
      },
      update: { data: application, status: "APPLIED" },
    })
    console.log(`  application created: ${ret}`)
  }
}
