import { useSession } from "blitz"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import PreviewEditor from "app/core/components/MarkdownPreview"
import { ProposalRoleType } from "@prisma/client"
import { isEns } from "app/core/utils/isEns"
import { useEnsAddress } from "wagmi"

export const PartnershipFormStepConfirm = ({ formState }) => {
  const session = useSession({ suspense: false })

  let contributorInput
  let clientInput
  // if proposing as contributor, take active user address
  // otherwise, resolve input ENS or address
  if (formState.values.proposingAs === ProposalRoleType.CONTRIBUTOR) {
    contributorInput = session?.siwe?.address
  } else {
    contributorInput = formState.values.contributor
  }
  // if proposing as client, take active user address
  // otherwise, resolve input ENS or address
  if (formState.values.proposingAs === ProposalRoleType.CLIENT) {
    clientInput = session?.siwe?.address
  } else {
    clientInput = formState.values.client
  }

  const { data: contributorAddress } = useEnsAddress({
    name: contributorInput,
    chainId: 1,
    cacheTime: 5 * 60 * 1000, // 5 minutes
    enabled: isEns(contributorInput), // don't run hook if not ENS to prevent console.error
  })
  const { data: clientAddress } = useEnsAddress({
    name: clientInput,
    chainId: 1,
    cacheTime: 5 * 60 * 1000, // 5 minutes
    enabled: isEns(contributorInput), // don't run hook if not ENS to prevent console.error
  })

  const { text: contributorDisplayAddress } = useDisplayAddress(
    contributorAddress || contributorInput
  )
  const { text: clientDisplayAddress } = useDisplayAddress(clientAddress || clientInput)

  return (
    <div className="flex flex-col space-y-4 mt-6">
      {/* CLIENT */}
      <div className="flex flex-row w-full items-top justify-between">
        <span className="font-bold">Client</span>
        <div className="flex flex-col items-end">
          {"@" + clientDisplayAddress}
          <span className="text-concrete text-xs">{clientAddress || clientInput}</span>
        </div>
      </div>
      {/* CONTRIBUTOR */}
      <div className="flex flex-row w-full items-top justify-between">
        <span className="font-bold">Contributor</span>
        <div className="flex flex-col items-end">
          {"@" + contributorDisplayAddress}
          <span className="text-concrete text-xs">{contributorAddress || contributorInput}</span>
        </div>
      </div>
      {/* TITLE */}
      <div className="flex flex-row w-full items-center justify-between">
        <span className="font-bold">Title</span>
        <span className="items-end">{formState.values.title}</span>
      </div>
      {/* DETAILS */}
      <div className="flex flex-col w-full">
        <span className="font-bold">Details</span>
        <div className="mt-4 mx-6">
          <PreviewEditor markdown={formState.values.body} />
        </div>
      </div>
    </div>
  )
}
