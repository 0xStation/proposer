import db from "./index"

// This seed function is executed when you run `blitz db seed -f db/wipe.ts`
const seed = async () => {
  console.log("Wiping database rows...")
  await db.checkApproval.deleteMany()
  await db.check.deleteMany()
  await db.proposalApproval.deleteMany()
  await db.accountProposal.deleteMany()
  await db.proposal.deleteMany()
  await db.rfp.deleteMany()
  await db.checkbook.deleteMany()
  await db.accountTerminalTag.deleteMany()
  await db.tag.deleteMany()
}

export default seed
