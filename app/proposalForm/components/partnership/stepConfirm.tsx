import { useSession } from "blitz"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import PreviewEditor from "app/core/components/MarkdownPreview"
import { ProposalRoleType } from "@prisma/client"

export const PartnershipFormStepConfirm = ({ formState }) => {
  const session = useSession({ suspense: false })

  let contributorAddress
  let clientAddress
  // if proposing as contributor, take active user address
  // otherwise, resolve input ENS or address
  if (formState.values.proposingAs === ProposalRoleType.CONTRIBUTOR) {
    contributorAddress = session?.siwe?.address
  } else {
    contributorAddress = formState.values.contributor
  }
  // if proposing as client, take active user address
  // otherwise, resolve input ENS or address
  if (formState.values.proposingAs === ProposalRoleType.CLIENT) {
    clientAddress = session?.siwe?.address
  } else {
    clientAddress = formState.values.client
  }

  const { text: clientDisplayAddress } = useDisplayAddress(clientAddress)
  const { text: contributorDisplayAddress } = useDisplayAddress(contributorAddress)

  return (
    <div className="flex flex-col space-y-4 mt-6">
      {/* CLIENT */}
      <div className="flex flex-row w-full items-center justify-between">
        <span className="font-bold">Client</span>
        <span className="items-end">{"@" + clientDisplayAddress}</span>
      </div>
      {/* CONTRIBUTOR */}
      <div className="flex flex-row w-full items-center justify-between">
        <span className="font-bold">Contributor</span>
        <span className="items-end">{"@" + contributorDisplayAddress}</span>
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
