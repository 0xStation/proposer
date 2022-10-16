import { useQuery, useRouterQuery } from "blitz"
import getRfpById from "app/rfp/queries/getRfpById"
import ReadMore from "app/core/components/ReadMore"
import Preview from "app/core/components/MarkdownPreview"

export const FoxesConfirmForm = ({ body }) => {
  const queryParams = useRouterQuery()
  const rfpId = queryParams?.rfpId as string
  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
      onSuccess: () => {
        console.log("rfp fetched", rfp)
      },
      cacheTime: 60 * 1000, // 1 minute in milliseconds
    }
  )

  return (
    <>
      <div className="flex flex-col mt-6 pb-6 border-b border-wet-concrete">
        <p>Upon confirmation, the proposal will be sent to Philosophical Foxes.</p>
      </div>
      {/* TO */}
      <div className="mt-6 flex flex-row w-full items-center justify-between">
        <span className="font-bold">To</span>
        <span className="items-end">@philosophicalfoxes.eth</span>
      </div>
      {/* RFP */}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">RFP</span>
        <span className="items-end">{rfp?.data.content.title}</span>
      </div>
      {/* TITLE */}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Title</span>
        <span className="items-end">{`${rfp?.data.content.title} submission`}</span>
      </div>
      {/* NETWORK */}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Network</span>
        <span className="items-end">Ethereum</span>
      </div>
      {/* PAYMENT TOKEN */}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Payment token</span>
        <span className="items-end">ETH</span>
      </div>
      {/* PAYMENT AMOUNT */}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Payment amount</span>
        <span className="items-end">0.01</span>
      </div>
      {/* DETAILS */}
      <div className="mt-4 flex flex-col w-full">
        <span className="font-bold">Details</span>
        <div className="mt-4 ml-6 mr-6">
          <Preview markdown={body} />
        </div>
      </div>
    </>
  )
}
