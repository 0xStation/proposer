import { BlitzPage, Image, Link, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import Gradient from "/public/gradients/0.png"
import { LockClosedIcon } from "@heroicons/react/solid"

const ProposalTypeSelection: BlitzPage = () => {
  return (
    <Layout title="New Proposal">
      <div className="mx-2 sm:mx-28 h-full">
        <h1 className="text-2xl font-bold pt-9 mx-4 mb-6">Select a proposal type</h1>
        <div className="pt-4 mx-4 flex flex-col sm:flex-row">
          <Link href={Routes.CreateFundingProposal()}>
            <div className="max-w-[325px] mb-3 sm:mr-3 rounded-md overflow-hidden bg-wet-concrete cursor-pointer hover:border hover:border-marble-white">
              <Image src={Gradient} height={800} />
              <h2 className="text-xl font-bold px-4 pt-4">Request funding</h2>
              <p className="pb-4 px-4 pt-3">Request funding in ETH or any ERC-20s.</p>
            </div>
          </Link>
          <Link href={Routes.CreateNonFundingProposal()}>
            <div className="max-w-[325px] mb-3 sm:mr-3 rounded-md overflow-hidden bg-wet-concrete cursor-pointer hover:border hover:border-marble-white">
              <Image src={Gradient} height={800} />
              <h2 className="text-xl font-bold px-4 pt-4">Submit feedback</h2>
              <p className="pb-4 px-4 pt-3">
                Submit feedback, feature requests and half-baked ideas.
              </p>
            </div>
          </Link>
          <div className="max-w-[325px] mb-3 sm:mr-3 rounded-md overflow-hidden bg-wet-concrete cursor-not-allowed">
            <LockClosedIcon className="h-8 w-8 absolute block z-50 fill-marble-white pt-2 pl-2" />
            <Image src={Gradient} height={800} className="opacity-50" />
            <h2 className="text-xl font-bold px-4 pt-4 opacity-50">Custom</h2>
            <p className="pb-4 px-4 pt-3 opacity-50">
              Customize execution using any smart contracts.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

ProposalTypeSelection.suppressFirstRenderFlicker = true

export default ProposalTypeSelection
