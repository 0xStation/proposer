import { useRouter } from "next/router"
import { useQuery } from "@blitzjs/rpc"
import { useParam, Routes } from "@blitzjs/next"
import Preview from "app/core/components/MarkdownPreview"
import { getNetworkName } from "app/core/utils/networkInfo"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import getRfpById from "app/rfp/queries/getRfpById"
import { useSession } from "@blitzjs/auth"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { ProposalRoleType } from "@prisma/client"

export const RfpProposalFormStepConfirm = ({ formState }) => {
  const session = useSession({ suspense: false })
  const rfpId = useParam("rfpId") as string
  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId as string,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
    }
  )

  const connectedAddress = session?.siwe?.address as string

  let contributorAddress
  let clientAddress
  if (rfp?.data?.proposal?.proposerRole === ProposalRoleType.CLIENT) {
    clientAddress = rfp.accountAddress
    contributorAddress = connectedAddress
  } else if (rfp?.data?.proposal?.proposerRole === ProposalRoleType.CONTRIBUTOR) {
    clientAddress = connectedAddress
    contributorAddress = rfp.accountAddress
  }

  const { text: clientDisplayAddress } = useDisplayAddress(clientAddress)
  const { text: contributorDisplayAddress } = useDisplayAddress(contributorAddress)

  return (
    <>
      <div className="flex flex-col mt-6 pb-6 border-b border-wet-concrete">
        <p>Upon confirmation, the proposal will be sent to the recipient for review.</p>
      </div>
      {/* CLIENT */}
      <div className="mt-6 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Client</span>
        <span className="items-end">
          {"@" +
            clientDisplayAddress +
            (addressesAreEqual(connectedAddress, clientAddress) ? " (you)" : "")}
        </span>
      </div>
      {/* CONTRIBUTOR */}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Contributor</span>
        <span className="items-end">
          {"@" +
            contributorDisplayAddress +
            (addressesAreEqual(connectedAddress, contributorAddress) ? " (you)" : "")}
        </span>
      </div>
      {/* TITLE */}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Title</span>
        <span className="items-end">{formState.values.title}</span>
      </div>
      {/* NETWORK */}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Network</span>
        <span className="items-end">
          {getNetworkName(rfp?.data?.proposal?.payment?.token?.chainId || 1)}
          {/* TODO choose from RFP or form input */}
        </span>
      </div>
      {/* PAYMENT TOKEN */}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Payment token</span>
        <span className="items-end">{rfp?.data?.proposal?.payment?.token?.symbol}</span>
      </div>
      {/* PAYMENT AMOUNT */}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Payment amount</span>
        <span className="items-end">{rfp?.data?.proposal?.payment?.amount}</span>
      </div>
      {/* DETAILS */}
      <div className="mt-4 flex flex-col w-full">
        <span className="font-bold">Details</span>
        <div className="mt-4 mx-6">
          <Preview markdown={formState.values.body} />
        </div>
      </div>
    </>
  )
}

export default RfpProposalFormStepConfirm
