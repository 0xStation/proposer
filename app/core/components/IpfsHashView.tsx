import { ExternalLinkIcon } from "@heroicons/react/solid"
import { ProposalNew } from "app/proposalNew/types"
import { LINKS } from "../utils/constants"
import { convertDateStringToDateAndTime } from "../utils/convertDateStringToDateAndTime"

export const IpfsHashView = ({
  proposal,
  className,
}: {
  proposal?: ProposalNew
  className?: string
}) => {
  return (
    <div className={`border border-b border-concrete rounded-2xl px-6 py-4 mt-9 ${className}`}>
      <div className="flex-row border-b border-b-concrete">
        {proposal?.data?.ipfsMetadata?.hash ? (
          <div className="basis-32 mb-3">
            <a
              className="inline mr-2 cursor-pointer"
              href={`${LINKS.PINATA_BASE_URL}${proposal?.data?.ipfsMetadata?.hash}`}
              rel="noreferrer"
            >
              <p className="inline font-bold tracking-wide uppercase text-concrete text-xs">
                Ipfs link
              </p>
              <ExternalLinkIcon className="inline h-4 w-4 fill-concrete cursor-pointer" />
            </a>
            <p className="hidden sm:inline">{proposal?.data?.ipfsMetadata?.hash}</p>
          </div>
        ) : (
          <div className="basis-32 mb-3">
            <p className="inline font-bold tracking-wide uppercase text-concrete text-xs mr-2">
              Ipfs link
            </p>
            <p className="hidden sm:inline text-concrete">Pending approval</p>
          </div>
        )}
      </div>
      <div className="flex-row mt-3">
        <p className="inline font-bold tracking-wide uppercase text-concrete text-xs mr-2">
          Ipfs timestamp
        </p>
        <p className="sm:inline uppercase">
          {/* convert to dd-MON-yyyy hh:mm AM/PM */}
          {convertDateStringToDateAndTime({
            timestamp: proposal?.data?.ipfsMetadata?.timestamp as string,
          })}
        </p>
      </div>
    </div>
  )
}
