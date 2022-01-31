import db from "../index"
import { Application, ApplicationMetadata } from "app/application/types"
import { Symbol } from "app/types"
import { contributors } from "./contributors"
import { request, gql } from "graphql-request"
import { wait } from "@testing-library/dom"
import { getWalletString } from "app/utils/getWalletString"

const applicant1: ApplicationMetadata & { id: number; applicantId: number; initiativeId: number } =
  {
    id: 1,
    applicantId: 1,
    initiativeId: 1,
    entryDescription: "hello world",
    url: "https://twitter.com/symmtry69",
  }

const stationApplications = [applicant1]

export async function seedApplications() {
  for (const name in stationApplications) {
    const application = stationApplications[name]
    const ret = await db.initiativeApplication.upsert({
      where: {
        id: 1,
      },
      create: {
        applicantId: application!.applicantId,
        initiativeId: application!.initiativeId,
        data: application,
      },
      update: { data: application },
    })
    console.log(`  application created: ${ret}`)
  }
}
