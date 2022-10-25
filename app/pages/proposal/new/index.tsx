import { BlitzPage, Image, Link, Routes, useRouterQuery, useQuery } from "blitz"
import { useState } from "react"
import Layout from "app/core/layouts/Layout"
import CustomImage from "/public/custom.webp"
import ShareImage from "/public/share-feedback.webp"
import RequestImage from "/public/request.webp"
import PartnershipImage from "/public/partnership.webp"
import { LockClosedIcon } from "@heroicons/react/solid"
import getRfpsForAccount from "app/rfp/queries/getRfpsForAccount"
import { RfpCard } from "app/rfp/components/RfpCard"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"

enum ProposalView {
  ProposalType = "ProposalType",
  RfpList = "RfpList",
}

const RfpListComponent = ({ rfps }) => {
  return (
    <div className="mx-40 mt-9">
      <h1 className="text-2xl font-bold mb-6">Select an RFP</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 sm:gap-2 md:gap-4 lg:gap-6 gap-1 mt-9">
        {rfps &&
          rfps?.length > 0 &&
          rfps?.map((rfp, idx) => {
            return <RfpCard key={idx} rfp={rfp} />
          })}
      </div>
    </div>
  )
}

const ProposalTypeSelection: BlitzPage = () => {
  const { clients, contributors } = useRouterQuery()
  const [view, setView] = useState<ProposalView>(ProposalView.ProposalType)

  const [rfps] = useQuery(
    getRfpsForAccount,
    {
      address: (clients || contributors) as string,
      paginationTake: 25,
      page: 0,
    },
    { suspense: false, enabled: Boolean(clients?.[0] || contributors?.[0]) }
  )

  return (
    <Layout title="New Proposal">
      {view === ProposalView.ProposalType && (
        <div className="w-full mx-auto max-w-fit mt-9">
          <div className="flex flex-row justify-between">
            <h1 className="text-2xl font-bold mb-6">Select a proposal type</h1>
            {Boolean(rfps?.length) && (
              <Button
                type={ButtonType.Secondary}
                className="align-middle mr-4"
                onClick={() => setView(ProposalView.RfpList)}
              >
                I&apos;m proposing to a specific RFP
              </Button>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 lg:gap-6 gap-2">
            {/* REQUEST FUNDING */}
            <Link
              href={Routes.ProposalNewFunding({
                clients: clients,
                contributors: contributors,
              })}
            >
              <div className="max-w-[325px] mb-3 sm:mr-3 rounded-md overflow-hidden bg-charcoal border border-wet-concrete hover:bg-wet-concrete cursor-pointer">
                <Image src={RequestImage} height={550} />
                <h2 className="text-xl font-bold px-4 pt-4">Request funding</h2>
                <p className="pb-4 px-4 pt-3">Request funding in ETH, USDC, or any ERC-20</p>
              </div>
            </Link>
            {/* SHARE AN IDEA */}
            <Link href={Routes.ProposalNewIdea({ clients: clients })}>
              <div className="max-w-[325px] mb-3 sm:mr-3 rounded-md overflow-hidden bg-charcoal border border-wet-concrete hover:bg-wet-concrete cursor-pointer">
                <Image src={ShareImage} height={550} />
                <h2 className="text-xl font-bold px-4 pt-4">Share an idea</h2>
                <p className="pb-4 px-4 pt-3">Share ideas, submit feedback, and request features</p>
              </div>
            </Link>
            {/* FORM A PARTNERSHIP */}
            <Link
              href={Routes.ProposalNewPartnership({
                clients: clients,
                contributors: contributors,
              })}
            >
              <div className="max-w-[325px] mb-3 sm:mr-3 rounded-md overflow-hidden bg-charcoal border border-wet-concrete hover:bg-wet-concrete cursor-pointer">
                {/* not sure why this image has to have a larger height, had to eye-ball it to choose this value */}
                <Image src={PartnershipImage} height={677} />
                <h2 className="text-xl font-bold px-4 pt-4">Form a partnership</h2>
                <p className="pb-4 px-4 pt-3">
                  Establish terms of partnership between organizations and individuals
                </p>
              </div>
            </Link>
            {/* CUSTOM */}
            <div className="max-w-[325px] mb-3 sm:mr-3 rounded-md overflow-hidden bg-charcoal border border-wet-concrete cursor-not-allowed">
              <LockClosedIcon className="h-8 w-8 absolute block z-50 fill-marble-white pt-2 pl-2" />
              <Image src={CustomImage} height={550} className="opacity-50" />
              <h2 className="text-xl font-bold px-4 pt-4 opacity-50">Custom</h2>
              <p className="pb-4 px-4 pt-3 opacity-50">
                Customize execution using any smart contracts
              </p>
            </div>
          </div>
        </div>
      )}
      {view === ProposalView.RfpList && <RfpListComponent rfps={rfps} />}
    </Layout>
  )
}

ProposalTypeSelection.suppressFirstRenderFlicker = true

export default ProposalTypeSelection
