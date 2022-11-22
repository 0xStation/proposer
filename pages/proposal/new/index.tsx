import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useState } from "react"
import Layout from "app/core/layouts/Layout"
import RfpImage from "/public/share-feedback.webp"
import ProposalImage from "/public/partnership.webp"
import { useSession } from "@blitzjs/auth"
import dynamic from "next/dynamic"
import useStore from "app/core/hooks/useStore"
import BackButtonLayout from "app/core/layouts/BackButtonLayout"

const RfpPreCreateModal = dynamic(() => import("app/rfp/components/RfpPreCreateModal"), {
  ssr: false,
})

const ProposalTypeSelection: BlitzPage = () => {
  const { clients, contributors } = useRouter().query
  const session = useSession({ suspense: false })
  const [isRfpPreCreateModalOpen, setIsRfpPreCreateModalOpen] = useState<boolean>(false)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)

  return (
    <>
      {session.siwe?.address && isRfpPreCreateModalOpen && (
        <RfpPreCreateModal
          isOpen={isRfpPreCreateModalOpen}
          setIsOpen={setIsRfpPreCreateModalOpen}
          accountAddress={session.siwe?.address}
        />
      )}
      <div className="w-full mx-auto max-w-fit mt-36 flex flex-row">
        {/* REQUEST FUNDING */}
        <Link
          href={Routes.ProposalNewFunding({
            clients: clients as string,
            contributors: contributors as string,
          })}
        >
          <div className="w-[383px] mb-3 sm:mr-3 rounded-md overflow-hidden bg-charcoal border border-wet-concrete hover:bg-wet-concrete cursor-pointer">
            <Image src={ProposalImage} height={838} />
            <h2 className="text-xl font-bold px-4 pt-4">Create a proposal</h2>
            <p className="pb-4 px-4 pt-3">
              Propose to collaborate with your favorite web3 contributors or DAOs.
            </p>
          </div>
        </Link>
        <button
          className="text-left"
          onClick={() => {
            if (!session.siwe?.address) {
              toggleWalletModal(true)
            } else {
              setIsRfpPreCreateModalOpen(true)
            }
          }}
        >
          <div className="max-w-[383px] mb-3 sm:mr-3 rounded-md overflow-hidden bg-charcoal border border-wet-concrete hover:bg-wet-concrete cursor-pointer">
            <Image src={RfpImage} height={677} />
            <h2 className="text-xl font-bold px-4 pt-4">Create an RFP</h2>
            <p className="pb-4 px-4 pt-3">
              Solicit proposals from contributors or clients and set collaboration terms.
            </p>
          </div>
        </button>
      </div>
    </>
  )
}

ProposalTypeSelection.suppressFirstRenderFlicker = true
ProposalTypeSelection.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="New Proposal">
      <BackButtonLayout>{page}</BackButtonLayout>
    </Layout>
  )
}

export default ProposalTypeSelection
