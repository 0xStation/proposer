import { ProposalVersion } from "@prisma/client"
import { ProposalVersionMetadata } from "app/proposalVersion/types"
import { DateTime } from "luxon"
import useDisplayAddress from "../../core/hooks/useDisplayAddress"
import networks from "../../utils/networks.json"
import { PAYMENT_TERM_MAP } from "../../core/utils/constants"
import truncateString from "../../core/utils/truncateString"
import CopyToClipboard from "app/core/components/CopyToClipboard"

const PaymentChangeBox = ({
  before = true,
  paymentChangeDetails,
  className = "bg-wet-concrete mr-2",
}: {
  before?: boolean
  paymentChangeDetails: any
  className?: string
}) => {
  const paymentChangeCopy = before ? "Before" : "After"
  const { text: displayAddress } = useDisplayAddress(paymentChangeDetails?.recipientAddress)

  return (
    <div className={`${className} mr-2 bg-wet-concrete p-2 rounded w-1/2`}>
      <label className="uppercase text-sm font-bold text-concrete tracking-wider">
        {paymentChangeCopy}
      </label>
      <p className="mt-2">{networks[paymentChangeDetails?.token?.chainId].name}</p>
      <p className="mt-2">
        {paymentChangeDetails?.amount} {paymentChangeDetails?.token?.name}
      </p>
      <p className="mt-2">
        {PAYMENT_TERM_MAP[paymentChangeDetails?.paymentTerms].copy}{" "}
        {paymentChangeDetails?.advancePaymentPercentage &&
          `· ${paymentChangeDetails?.advancePaymentPercentage} %`}
      </p>
      <div className="mt-2 flex flex-row">
        <p className="mr-1 leading-5">To: {displayAddress} </p>
        <CopyToClipboard text={paymentChangeDetails?.recipientAddress || ""} />
      </div>
    </div>
  )
}

export const ProposalVersionBox = ({
  proposalVersion,
  className,
}: {
  proposalVersion: ProposalVersion
  className?: string
}) => {
  const { text: editorDisplayName } = useDisplayAddress(proposalVersion?.editorAddress)

  return (
    <div className={`border border-b border-concrete rounded-2xl mt-6 px-6 py-9 ${className}`}>
      <label className="uppercase text-sm font-bold text-concrete tracking-wider">Changes</label>
      <h1 className="mt-4">{(proposalVersion?.data as ProposalVersionMetadata)?.content?.title}</h1>
      <p className="text-concrete mt-1 mb-2">
        Edited by {editorDisplayName} on{" "}
        {/* DATETIME_FULL formatting example: 'April 20, 2017 at 11:32 AM EDT' */}
        {DateTime.fromJSDate(proposalVersion?.createdAt as Date).toLocaleString(
          DateTime.DATETIME_FULL
        )}
      </p>
      {(proposalVersion?.data as ProposalVersionMetadata)?.content?.body && (
        <div className="mt-6">
          <label className="uppercase text-sm font-bold text-concrete tracking-wider">
            Note from {editorDisplayName}
          </label>
          <p className="mt-4">
            &quot;{(proposalVersion?.data as ProposalVersionMetadata)?.content?.body}&quot;
          </p>
        </div>
      )}
      {(proposalVersion?.data as ProposalVersionMetadata)?.changes?.payments &&
        (proposalVersion?.data as ProposalVersionMetadata)?.changes?.payments?.map(
          (paymentChange, idx) => {
            return (
              <div className="mt-6 w-full" key={idx}>
                <label className="uppercase text-sm font-bold text-concrete tracking-wider">
                  Payments
                </label>
                <div className="mt-4 flex flex-row w-full">
                  <PaymentChangeBox before={true} paymentChangeDetails={paymentChange?.before} />
                  <PaymentChangeBox
                    className="bg-magic-mint bg-opacity-20 "
                    before={false}
                    paymentChangeDetails={paymentChange?.before}
                  />
                </div>
              </div>
            )
          }
        )}
    </div>
  )
}

export default ProposalVersionBox
