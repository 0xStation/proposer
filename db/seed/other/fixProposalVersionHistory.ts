import db, { PrismaPromise } from "db"
import { ProposalMetadata } from "app/proposal/types"
import { ProposalVersionMetadata } from "app/proposalVersion/types"

const seed = async () => {
  const allProposals = await db.proposal.findMany({
    include: {
      roles: true,
      payments: true,
      milestones: true,
    },
  })

  allProposals?.forEach(async (proposal) => {
    // Get all of the proposalVersions for this proposal
    const proposalVersions = await db.proposalVersion.findMany({
      where: {
        proposalId: proposal?.id,
      },
      orderBy: [
        {
          version: "asc",
        },
      ],
    })

    const updateVerionQueries = proposalVersions.map(async (proposalVersion, idx) => {
      if (proposalVersion?.version === 1) {
        // the first version has the correct signature message already
        return
      }

      // the next signature has the current proposal's correct signature
      let followingSignature
      if (proposalVersion.version === proposal.version) {
        // this occurs for the latest proposal version
        followingSignature = Object.assign(
          {},
          (proposal?.data as ProposalMetadata)?.signatureMessage
        )
      } else {
        const followingProposalVersion = await db.proposalVersion.findUnique({
          where: {
            proposalId_version: {
              proposalId: proposal?.id as string,
              version: proposalVersion?.version + 1,
            },
          },
        })
        followingSignature = Object.assign(
          {},
          (followingProposalVersion?.data as ProposalVersionMetadata)?.proposalSignatureMessage
        )
      }

      await db.proposalVersion.update({
        where: {
          proposalId_version: {
            proposalId: proposal?.id as string,
            version: proposalVersion?.version,
          },
        },
        data: {
          data: {
            ...(proposalVersion && (proposalVersion?.data as {})),
            proposalSignatureMessage: followingSignature,
          },
        },
      })
    }) as PrismaPromise<any>[]

    try {
      await db.$transaction(updateVerionQueries)
    } catch (err) {
      console.error("error!", err)
    }
  })
}

export default seed
