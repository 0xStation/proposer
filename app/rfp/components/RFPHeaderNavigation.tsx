import { useState } from "react"
import { useRouter, Link, Routes, useParam, useQuery } from "blitz"
import getRfpById from "../queries/getRfpById"
import { XCircleIcon, PencilIcon, LinkIcon } from "@heroicons/react/solid"

const RFPHeaderNavigation = ({ rfpId }) => {
  const terminalHandle = useParam("terminalHandle") as string
  const [isRFPUrlCopied, setIsRfpUrlCopied] = useState<boolean>(false)
  const [rfp] = useQuery(getRfpById, { id: rfpId }, { suspense: false, enabled: !!rfpId })
  const router = useRouter()
  return (
    <div className="max-h-[250px] sm:h-60 border-b border-concrete pl-6 pt-6 pr-4">
      <div className="flex flex-row justify-between">
        <p className="self-center">
          <span className="text-concrete hover:text-light-concrete">
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
          <div className="flex flex-row items-center space-x-2 mt-3">
            <span className="h-2 w-2 rounded-full bg-concrete" />
            <span className="text-xs uppercase tracking-wider">{rfp?.status}</span>
          </div>
          <div className="flex flex-row w-full mt-3">
            <div className="flex flex-col w-full">
              <div className="flex justify-between w-full">
                <h1 className="text-2xl font-bold">RFP: {rfp?.data?.content?.title}</h1>
                <div className="inline self-center mr-6 mb-6">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href).then(() => {
                        setIsRfpUrlCopied(true)
                        setTimeout(() => setIsRfpUrlCopied(false), 1000)
                      })
                      setIsRfpUrlCopied(true)
                    }}
                  >
                    <LinkIcon className="inline h-6 w-6 fill-concrete mr-3 hover:cursor-pointer hover:fill-light-concrete" />
                  </button>
                  {isRFPUrlCopied && (
                    <span className="mt-2 text-[.5rem] ml-[-10px] uppercase font-bold tracking-wider rounded px-1 absolute text-marble-white bg-wet-concrete">
                      copied!
                    </span>
                  )}
                  <button>
                    <PencilIcon className="inline h-6 w-6 fill-concrete mr-3 hover:cursor-pointer hover:fill-light-concrete" />
                  </button>
                  <button>
                    <XCircleIcon className="inline h-6 w-6 fill-concrete hover:cursor-pointer hover:fill-light-concrete" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ul className="mt-7 text-lg">
        <li
          className={`inline mr-8 cursor-pointer ${
            router.pathname === Routes.RFPInfoTab({ terminalHandle, rfpId: rfpId }).pathname
              ? "font-bold text-marble-white"
              : "text-concrete hover:text-light-concrete"
          }`}
        >
          <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: rfpId })}>Info</Link>
        </li>
        <li
          className={`inline cursor-pointer ${
            router.pathname === Routes.ProposalsTab({ terminalHandle, rfpId: rfpId }).pathname
              ? "font-bold text-marble-white"
              : "text-concrete hover:text-light-concrete"
          }`}
        >
          <Link href={Routes.ProposalsTab({ terminalHandle, rfpId: rfpId })}>Proposals</Link>
        </li>
      </ul>
    </div>
  )
}

export default RFPHeaderNavigation
