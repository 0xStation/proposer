import { gSSP } from "app/blitz-server"
import Link from "next/link"
import { invoke, useQuery } from "@blitzjs/rpc"
import { BlitzPage, useParam, Routes } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
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
import { useInbox } from "app/inbox/hooks/useInbox"
import { genUrlFromRoute } from "app/utils/genUrlFromRoute"
import { useCheck } from "app/check/hooks/useCheck"
import { SignatureCheckbox } from "app/check/components/SignatureCheckbox"
import { Form } from "react-final-form"
import BatchCheckModal from "app/check/components/BatchCheckModal"

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

const ViewInbox: BlitzPage = () => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const inboxId = useParam("inboxId", "string") as string
  const [newCheckModalOpen, setNewCheckModalOpen] = useState<boolean>(false)
  const [viewCheckModalOpen, setViewCheckModalOpen] = useState<boolean>(false)
  const [selectedCheck, setSelectedCheck] = useState<Check>()
  console.log(checkbookAddress, checkbookChainId)

  const { inbox } = useInbox(inboxId)
  const inboxRequestUrl =
    typeof window !== "undefined"
      ? window?.location?.host +
        genUrlFromRoute(Routes.InboxRequest({ inboxId: inboxId as string }))
      : ""

  const { checks } = useChecks(checkbookChainId, checkbookAddress, [inboxId])
  const [selectedChecks, setSelectedChecks] = useState<Check[]>()
  const [batchCheckModalOpen, setBatchCheckModalOpen] = useState<boolean>(false)

  return (
    <>
      <NewCheckModal isOpen={newCheckModalOpen} setIsOpen={setNewCheckModalOpen} />
      {selectedCheck && (
        <ViewCheckModal
          check={selectedCheck}
          isOpen={viewCheckModalOpen}
          setIsOpen={setViewCheckModalOpen}
        />
      )}
      <Form
        onSubmit={async (values: any, form) => {
          if (Boolean(checks) && checks?.length) {
            setSelectedChecks(
              Object.entries(values)
                .filter(([key, value]) =>
                  checks?.find((check) => check?.id === key && value === true)
                )
                .map(([key]) => checks.find((check) => check.id === key)) as Check[]
            )
            setBatchCheckModalOpen(true)
          }
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          return (
            <form>
              {selectedChecks && (
                <BatchCheckModal
                  checks={selectedChecks}
                  isOpen={batchCheckModalOpen}
                  setIsOpen={setBatchCheckModalOpen}
                  form={form}
                />
              )}
              <div className="flex flex-row justify-between">
                <h1 className="text-2xl font-bold">{inbox?.data?.name}</h1>
                <div className="flex flex-row space-x-4 items-center">
                  <Button
                    type={ButtonType.Secondary}
                    onClick={(e) => {
                      e.preventDefault()
                      navigator.clipboard.writeText(inboxRequestUrl)
                    }}
                  >
                    Copy Request Link
                  </Button>
                  <Button isSubmitType={true} onClick={handleSubmit} isDisabled={!formState.dirty}>
                    Approve
                  </Button>
                </div>
              </div>
              <table className="mt-8 min-w-[600px] md:w-full">
                <thead className="overflow-x-auto min-w-[600px]">
                  <tr className="border-t border-b border-wet-concrete justify-start">
                    <th className="text-xs tracking-wide uppercase text-concrete"></th>
                    <th className="text-xs tracking-wide uppercase text-concrete py-2 text-left">
                      ID
                    </th>
                    <th className="text-xs tracking-wide uppercase text-concrete py-2 text-left">
                      Status
                    </th>
                    <th className="text-xs tracking-wide uppercase text-concrete py-2 text-left">
                      Title
                    </th>
                    <th className="text-xs tracking-wide uppercase text-concrete py-2 text-left">
                      Created
                    </th>
                  </tr>
                </thead>
                {/* TABLE BODY */}
                <tbody>
                  {checks &&
                    checks.length > 0 &&
                    checks.map((check, idx) => {
                      return (
                        <tr
                          key={`check-${idx}`}
                          onClick={() => {
                            setSelectedCheck(check)
                            setViewCheckModalOpen(true)
                          }}
                          className="h-18 border-b border-charcoal cursor-pointer hover:bg-charcoal justify-start"
                        >
                          <td className="group align-middle" onClick={(e) => e.stopPropagation()}>
                            <SignatureCheckbox
                              check={check}
                              className="left-1/2 -translate-x-1/2 mt-1"
                            />
                          </td>
                          <td className="text-base py-4 text-concrete">{check.nonce}</td>
                          <td className="py-4">
                            <CheckStatusIndicator check={check} hideCounter={true} />
                          </td>
                          <td>
                            <div className="flex justify-between items-center pr-6">
                              <p className="text-base py-4">
                                {check.data.title.length > 84
                                  ? check.data.title.substr(0, 84) + "..."
                                  : check.data.title}
                              </p>
                              {check.inbox && (
                                <Link
                                  href={Routes.ViewInbox({
                                    chainId: checkbookChainId,
                                    address: checkbookAddress,
                                    inboxId: check.inboxId as string,
                                  })}
                                >
                                  <div className="w-fit border border-wet-concrete text-concrete-115 text-sm rounded-full px-3 py-1 bg-tunnel-black hover:bg-wet-concrete">
                                    {check.inbox?.data.name}
                                  </div>
                                </Link>
                              )}
                            </div>
                          </td>
                          <td className="text-sm py-4 text-concrete">
                            {formatDate(check.createdAt)}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
              {!checks &&
                Array.from(Array(10)).map((idx) => (
                  <div
                    key={idx}
                    tabIndex={0}
                    className={`flex flex-row w-full my-1 rounded-lg bg-wet-concrete shadow border-solid h-[48px] motion-safe:animate-pulse`}
                  />
                ))}
            </form>
          )
        }}
      />
    </>
  )
}

ViewInbox.suppressFirstRenderFlicker = true
ViewInbox.getLayout = function getLayout(page) {
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
export default ViewInbox
