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
import { SignatureThreshold } from "app/checkbook/components/SignatureThreshold"

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

const SettingsHome: BlitzPage = () => {
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
    <div>
      <SignatureThreshold />
    </div>
  )
}

SettingsHome.suppressFirstRenderFlicker = true
SettingsHome.getLayout = function getLayout(page) {
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
export default SettingsHome
