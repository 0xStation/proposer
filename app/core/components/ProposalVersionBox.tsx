import { ProposalVersion } from "@prisma/client"
import { ProposalVersionMetadata } from "app/proposalVersion/types"
import { DateTime } from "luxon"
import useDisplayAddress from "../hooks/useDisplayAddress"
import networks from "../../utils/networks.json"
import { PAYMENT_TERM_MAP } from "../utils/constants"
import truncateString from "../utils/truncateString"

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
                  <div className="mr-2 bg-wet-concrete p-2 rounded w-1/2">
                    <label className="uppercase text-sm font-bold text-concrete tracking-wider">
                      Before
                    </label>
                    <p className="mt-2">{networks[paymentChange?.before?.token?.chainId].name}</p>
                    <p className="mt-2">
                      {paymentChange?.before?.amount} {paymentChange?.before?.token?.name}
                    </p>
                    <p className="mt-2">
                      {PAYMENT_TERM_MAP[paymentChange?.before?.paymentTerms].copy}{" "}
                      {paymentChange?.before?.advancePaymentPercentage &&
                        `· ${paymentChange?.before?.advancePaymentPercentage} %`}
                    </p>
                    <p className="mt-2">
                      To: {truncateString(paymentChange?.before?.recipientAddress)}
                    </p>
                  </div>
                  <div className="bg-magic-mint bg-opacity-20 p-2 rounded w-1/2">
                    <label className="uppercase text-sm font-bold text-concrete tracking-wider">
                      After
                    </label>
                    <p className="mt-2">{networks[paymentChange?.after?.token?.chainId].name}</p>
                    <p className="mt-2">
                      {paymentChange?.after?.amount} {paymentChange?.after?.token?.name}
                    </p>
                    <p className="mt-2">
                      {PAYMENT_TERM_MAP[paymentChange?.after?.paymentTerms].copy}{" "}
                      {paymentChange?.after?.advancePaymentPercentage &&
                        `· ${paymentChange?.after?.advancePaymentPercentage} %`}
                    </p>
                    <p className="mt-2">
                      To: {truncateString(paymentChange?.after?.recipientAddress)}
                    </p>
                  </div>
                </div>
              </div>
            )
          }
        )}
    </div>
  )
}

export default ProposalVersionBox
