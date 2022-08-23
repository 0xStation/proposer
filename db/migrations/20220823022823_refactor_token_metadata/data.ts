import db from "../../index"

// run with: blitz db seed -f db/migrations/20220823022823_refactor_token_metadata/data.ts
const seed = async () => {
  // refetch token metadata for terminal tags to save name

  // update rfp funding tokens to save complete token metadata
  
  const rfps = await db.rfp.findMany({
    include: {
      proposals: true,
    },
  })
  
  // update proposal funding tokens to save complete token metadata

  
  const updates = []

  const res = await db.$transaction(updates)
  console.log("proposal status update transaction complete", res.length)
}

export default seed