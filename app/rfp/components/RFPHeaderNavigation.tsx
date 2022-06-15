import EditIcon from "app/core/icons/EditIcon"
import CloseActionIcon from "app/core/icons/CloseActionIcon"
import CopyLinkIcon from "app/core/icons/CopyLinkIcon"
import { useRouter, Image, BlitzPage, Link, Routes, useParam, useQuery } from "blitz"
import getRfpById from "../queries/getRfpById"

const RFPHeaderNavigation = ({ rfpId }) => {
  const terminalHandle = useParam("terminalHandle") as string
  const [rfp] = useQuery(getRfpById, { id: rfpId }, { suspense: false, enabled: !!rfpId })
  const router = useRouter()
  return (
    <div className="max-h-[250px] sm:h-60 border-b border-concrete pl-6 pt-6 pr-4">
      <div className="flex flex-row justify-between">
        <p className="self-center">
          <span className="text-concrete">
            <Link href={Routes.BulletinPage({ terminalHandle })}>Bulletin</Link> /&nbsp;
          </span>
          RFP: {rfp?.data?.content?.title}
        </p>
        <button className="bg-magic-mint text-tunnel-black rounded h-[35px] px-9 hover:bg-opacity-70">
          Create proposal
        </button>
      </div>
      <div className="flex flex-row mt-6">
        <div className="flex-col w-full">
          <div className="bg-neon-carrot rounded-full min-h-1.5 max-h-1.5 min-w-1.5 max-w-1.5 inline-block align-middle mr-1">
            &nbsp;
          </div>
          <p className="uppercase text-xs inline-block mt-3">Starting Soon</p>
          <div className="flex flex-row w-full mt-3">
            <div className="flex flex-col w-full">
              <div className="flex justify-between w-full">
                <h1 className="text-2xl font-bold">RFP: {rfp?.data?.content?.title}</h1>
                <div className="flex flex-row self-center mr-6">
                  <CopyLinkIcon className="pb-1 mr-3 hover:cursor-pointer hover:fill-marble-white" />
                  <EditIcon className="mr-3 hover:cursor-pointer group-hover:fill-marble-white" />
                  <CloseActionIcon className="hover:cursor-pointer hover:fill-marble-white" />
                </div>
              </div>
              <p>
                <span className="text-concrete">RFP-{rfpId}</span> · {rfp?.data?.content?.body}
              </p>
            </div>
          </div>
        </div>
      </div>
      <ul className="mt-7 text-lg">
        <li
          className={`inline mr-8 cursor-pointer ${
            router.pathname ===
            Routes.RequestForProposalInfoPage({ terminalHandle, rfpId: rfpId }).pathname
              ? "font-bold text-marble-white"
              : "text-concrete"
          }`}
        >
          <Link href={Routes.RequestForProposalInfoPage({ terminalHandle, rfpId: rfpId })}>
            Info
          </Link>
        </li>
        <li
          className={`inline cursor-pointer ${
            router.pathname === Routes.ProposalsPage({ terminalHandle, rfpId: rfpId }).pathname
              ? "font-bold text-marble-white"
              : "text-concrete"
          }`}
        >
          <Link href={Routes.ProposalsPage({ terminalHandle, rfpId: rfpId })}>Proposals</Link>
        </li>
      </ul>
    </div>
  )
}

export default RFPHeaderNavigation
