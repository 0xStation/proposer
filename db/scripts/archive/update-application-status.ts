import db, { AccountInitiativeStatus } from "../../index"

// blitz db seed -f db/scripts/update-application-status.ts
const seed = async () => {
  const applications = await db.accountInitiative.findMany()

  for (let a in applications) {
    let application = applications[a]

    if (!application) {
      continue
    }

    let status: AccountInitiativeStatus | "CONTRIBUTOR" | "INVITED" | "APPLIED" = application.status

    let updatedStatus: AccountInitiativeStatus =
      //@ts-ignore
      status === "CONTRIBUTOR" || status === "INVITED"
        ? "CONTRIBUTING"
        : //@ts-ignore
        status === "APPLIED"
        ? "INTERESTED"
        : "PREVIOUSLY_CONTRIBUTED"

    await db.accountInitiative.update({
      where: {
        accountId_initiativeId: {
          accountId: application.accountId,
          initiativeId: application.initiativeId,
        },
      },
      data: {
        status: updatedStatus,
      },
    })
  }
}

export default seed
