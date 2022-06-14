import EditIcon from "app/core/icons/EditIcon"
import { useRouter, Image, BlitzPage, Link, Routes, useParam, useQuery } from "blitz"

const RFPHeaderNavigation = () => {
  const terminalHandle = useParam("terminalHandle") as string
  const router = useRouter()
  return (
    <div className="max-h-[250px] sm:h-60 border-b border-concrete pl-6 pt-6 pr-4">
      <div className="flex flex-row">
        <span className="text-concrete">Bulletin / </span> RFP: Education
      </div>
      <div className="flex flex-row mt-6">
        <div className="flex-col w-full">
          <div className="bg-neon-carrot rounded-full min-h-1.5 max-h-1.5 min-w-1.5 max-w-1.5 inline-block align-middle mr-1">
            &nbsp;
          </div>
          <p className="uppercase text-xs inline-block mt-3">Starting Soon</p>
          <div className="flex flex-row w-full justify-between mt-3">
            <div>
              <h1 className="text-2xl font-bold">RFP: Education</h1>
              <p>
                <span className="text-concrete">RFP-1</span> · Projects that educate about Olympus
              </p>
            </div>
            <div className="self-center">
              <EditIcon className="self-center" />
            </div>
          </div>
        </div>
      </div>
      <ul className="mt-7 text-lg">
        <li
          className={`inline mr-8 cursor-pointer ${
            router.pathname ===
            Routes.RequestForProposalBulletinInfoPage({ terminalHandle }).pathname
              ? "font-bold text-marble-white"
              : "text-concrete"
          }`}
        >
          <Link href={Routes.RequestForProposalBulletinInfoPage({ terminalHandle })}>Info</Link>
        </li>
        <li
          className={`inline cursor-pointer ${
            router.pathname ===
            Routes.RequestForProposalBulletinProposalsPage({ terminalHandle }).pathname
              ? "font-bold text-marble-white"
              : "text-concrete"
          }`}
        >
          <Link href={Routes.RequestForProposalBulletinProposalsPage({ terminalHandle })}>
            Proposals
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default RFPHeaderNavigation
