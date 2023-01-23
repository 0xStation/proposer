import { gSSP } from "app/blitz-server"
import Link from "next/link"
import { invoke, useQuery } from "@blitzjs/rpc"
import { BlitzPage, useParam, Routes } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import Button from "app/core/components/sds/buttons/Button"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { formatDate } from "app/core/utils/formatDate"
import { isAddress } from "ethers/lib/utils"
import { useRouter } from "next/router"
import getCheckbook from "app/checkbook/queries/getCheckbook"
import { useChecks } from "app/check/hooks/useChecks"
import CheckbookSidebar from "app/checkbook/components/CheckbookSidebar"
import { useState } from "react"
import NewCheckModal from "app/check/components/NewCheckModal"
import ViewCheckModal from "app/check/components/ViewCheckModal"
import { Check } from "app/check/types"
import { CheckStatusIndicator } from "app/check/components/CheckStatusIndicator"
import { useSafeMetadata } from "app/safe/hooks/useSafeMetadata"
import getChecks from "app/check/queries/getChecks"
import { useInboxes } from "app/inbox/hooks/useInboxes"
import NewInboxModal from "app/inbox/components/NewInboxModal"
import { useCheckbook } from "app/checkbook/hooks/useCheckbook"

// export const getServerSideProps = gSSP(async ({ params = {} }) => {
//   const { chainId, address } = params

//   if (!chainId || !address || !isAddress(address as string)) {
//     return {
//       notFound: true,
//     }
//   }

//   const checkbook = await invoke(getCheckbook, {
//     chainId: parseInt(chainId),
//     address: toChecksumAddress(address as string),
//   })

//   if (!checkbook) {
//     return {
//       notFound: true,
//     }
//   }

//   return {
//     props: {}, // will be passed to the page component as props
//   }
// })

const InboxesHome: BlitzPage = () => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const [newCheckModalOpen, setNewCheckModalOpen] = useState<boolean>(false)
  const [viewCheckModalOpen, setViewCheckModalOpen] = useState<boolean>(false)
  const [selectedCheck, setSelectedCheck] = useState<Check>()
  const [newInboxModalOpen, setNewInboxModalOpen] = useState<boolean>(false)

  const router = useRouter()

  const { checkbook } = useCheckbook(checkbookChainId, checkbookAddress)
  const { inboxes } = useInboxes(checkbookChainId, checkbookAddress)

  return (
    <>
      <NewInboxModal
        isOpen={newInboxModalOpen}
        setIsOpen={setNewInboxModalOpen}
        checkbook={checkbook!}
      />
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-bold">Inboxes</h1>
        <Button
          className="hidden md:block w-full px-10"
          overrideWidthClassName="max-w-fit"
          onClick={() => {
            setNewInboxModalOpen(true)
          }}
        >
          New Inbox
        </Button>
      </div>
      {/* PROPOSALS TABLE */}
      <table className="mt-8 min-w-[600px] md:w-full">
        {/* TABLE HEADERS */}
        <thead className="overflow-x-auto min-w-[600px]">
          <tr className="border-t border-b border-wet-concrete">
            <th className="pl-4 w-64 text-xs tracking-wide uppercase text-concrete py-2 text-left">
              Name
            </th>
            <th className="text-xs tracking-wide uppercase text-concrete py-2 text-left">Notes</th>
          </tr>
        </thead>
        {/* TABLE BODY */}
        <tbody>
          {inboxes &&
            inboxes.length > 0 &&
            inboxes.map((inbox, idx) => {
              return (
                <tr
                  key={`inbox-${idx}`}
                  className="h-18 border-b border-charcoal cursor-pointer hover:bg-charcoal"
                  onClick={() => {
                    router.push(
                      Routes.ViewInbox({
                        chainId: checkbookChainId,
                        address: checkbookAddress,
                        inboxId: inbox.id,
                      })
                    )
                  }}
                >
                  <td className="pl-4 text-base py-4 font-bold">
                    {inbox.data.name.length > 44
                      ? inbox.data.name.substr(0, 44) + "..."
                      : inbox.data.name}
                  </td>
                  {/* LAST UPDATED */}
                  <td className="text-base py-4">
                    {inbox.data.notes.length > 96
                      ? inbox.data.notes.substr(0, 96) + "..."
                      : inbox.data.notes}
                  </td>
                </tr>
                // </button>
              )
            })}
        </tbody>
      </table>
      {!inboxes &&
        Array.from(Array(10)).map((idx) => (
          <div
            key={idx}
            tabIndex={0}
            className={`flex flex-row w-full my-1 rounded-lg bg-wet-concrete shadow border-solid h-[48px] motion-safe:animate-pulse`}
          />
        ))}
    </>
  )
}

InboxesHome.suppressFirstRenderFlicker = true
InboxesHome.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="Checkbook">
      <div className="flex flex-col md:flex-row h-full">
        <CheckbookSidebar />
        <div className="p-5 md:p-10 w-full max-h-screen overflow-y-auto">{page}</div>
      </div>
    </Layout>
  )
}
export default InboxesHome
