import { useState, useEffect } from "react"
import { BlitzPage, Routes, useParam, useQuery, Link, useRouterQuery, invalidateQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import Modal from "app/core/components/Modal"
import SuccessProposalModal from "app/proposal/components/SuccessProposalModal"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import RfpHeaderNavigation from "app/rfp/components/RfpHeaderNavigation"
import getProposalsByRfpId from "app/proposal/queries/getProposalsByRfpId"
import getRfpById from "app/rfp/queries/getRfpById"
import BackArrow from "app/core/icons/BackArrow"
import ForwardArrow from "app/core/icons/ForwardArrow"
import {
  DEFAULT_PFP_URLS,
  PROPOSAL_STATUS_DISPLAY_MAP,
  PAGINATION_TAKE,
} from "app/core/utils/constants"
import { formatDate } from "app/core/utils/formatDate"
import { genPathFromUrlObject } from "app/utils"
import { Rfp } from "app/rfp/types"
import { Proposal, ProposalStatus } from "app/proposal/types"
import FilterPill from "app/core/components/FilterPill"

const ProposalsTab: BlitzPage = () => {
  const { proposalId } = useRouterQuery() as { proposalId: string }
  const terminalHandle = useParam("terminalHandle") as string
  const rfpId = useParam("rfpId") as string
  const [proposalStatusFilters, setProposalStatusFilters] = useState<Set<ProposalStatus>>(
    new Set<ProposalStatus>()
  )
  const [page, setPage] = useState<number>(0)
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )

  const [proposals] = useQuery(
    getProposalsByRfpId,
    { rfpId: rfpId, page: 1, paginationTake: PAGINATION_TAKE },
    { suspense: false, enabled: !!rfpId }
  )

  const [rfp] = useQuery(getRfpById, { id: rfpId }, { suspense: false, enabled: !!rfpId })

  const [proposalCreatedConfirmationModal, setProposalCreatedConfirmationModal] =
    useState<boolean>(false)
  const [linkCopied, setLinkCopied] = useState<boolean>(false)

  useEffect(() => {
    if (proposalId) {
      setProposalCreatedConfirmationModal(true)
    }
  }, [proposalId])

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Bulletin`}>
      {terminal && (
        <SuccessProposalModal
          terminal={terminal}
          rfpId={rfpId}
          proposalId={proposalId}
          isOpen={proposalCreatedConfirmationModal}
          setIsOpen={setProposalCreatedConfirmationModal}
        />
      )}
      {terminal && (
        <Modal open={proposalCreatedConfirmationModal} toggle={setProposalCreatedConfirmationModal}>
          <div className="p-2">
            <h3 className="text-2xl font-bold pt-6">Request successfully published!</h3>
            <p className="mt-2">
              Copy the link to share with your community and let the waves of ideas carry you to the
              exciting future of {terminal.data.name}.
            </p>
            <div className="mt-8">
              <button
                type="button"
                className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 px-4 rounded hover:opacity-75"
                onClick={() => {
                  setLinkCopied(true)
                  navigator.clipboard.writeText(
                    genPathFromUrlObject(
                      Routes.ProposalPage({ terminalHandle, rfpId: rfpId, proposalId: proposalId })
                    )
                  )
                }}
              >
                {linkCopied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </Modal>
      )}
      <TerminalNavigation>
        <RfpHeaderNavigation rfpId={rfpId} />
        <div className="h-[calc(100vh-240px)] flex flex-col">
          <div className="w-full h-20 flex sm:flex-row justify-between items-center">
            <div className="flex ml-5">
              <FilterPill
                label="Status"
                filterValues={[{ name: "", value: "" }]}
                appliedFilters={proposalStatusFilters}
                setAppliedFilters={setProposalStatusFilters}
                setPage={setPage}
              />
            </div>
            <div className="ml-6 sm:mr-6 text-sm pt-1">
              Showing
              <span className="text-electric-violet font-bold"> {page * PAGINATION_TAKE + 1} </span>
              to
              <span className="text-electric-violet font-bold">
                {" "}
                {(page + 1) * PAGINATION_TAKE > proposals?.length!
                  ? proposals?.length
                  : (page + 1) * PAGINATION_TAKE}{" "}
              </span>
              of
              <span className="font-bold"> {proposals?.length} </span>
              members
              <button className="w-6 ml-2" disabled={page === 0} onClick={() => setPage(page - 1)}>
                <BackArrow className={`${page === 0 ? "fill-concrete" : "fill-marble-white"}`} />
              </button>
              <button
                disabled={proposals?.length! < PAGINATION_TAKE}
                onClick={() => setPage(page + 1)}
              >
                <ForwardArrow
                  className={`${
                    proposals?.length! < PAGINATION_TAKE ? "fill-concrete" : "fill-marble-white"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-b border-concrete h-[44px] text-concrete uppercase text-xs font-bold w-full flex flex-row items-end">
            <span className="basis-[38rem] ml-6 mb-2">Proposal</span>
            <span className="basis-32 ml-9 mb-2">Approval</span>
            <span className="basis-32 ml-6 mb-2">Amount</span>
            <span className="basis-32 ml-2 mb-2">Submitted Date</span>
            <span className="basis-32 ml-6 mr-6 mb-2">Creator</span>
          </div>
          <div className="h-[calc(100vh-284px)] overflow-y-auto">
            {proposals &&
              rfp &&
              proposals.map((proposal, idx) => (
                <ProposalComponent
                  terminalHandle={terminalHandle}
                  proposal={proposal}
                  rfp={rfp}
                  key={idx}
                />
              ))}
          </div>
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

const ProposalComponent = ({
  proposal,
  rfp,
  terminalHandle,
}: {
  proposal: Proposal
  rfp: Rfp
  terminalHandle: string
}) => {
  return (
    <Link href={Routes.ProposalPage({ terminalHandle, rfpId: rfp.id, proposalId: proposal.id })}>
      <div className="border-b border-concrete w-full cursor-pointer hover:bg-wet-concrete pt-5">
        <div className="flex flex-row items-center space-x-2 ml-6">
          <span
            className={`h-2 w-2 rounded-full ${
              PROPOSAL_STATUS_DISPLAY_MAP[proposal.status]?.color || "bg-concrete"
            }`}
          />
          <span className="text-xs uppercase tracking-wider">
            {PROPOSAL_STATUS_DISPLAY_MAP[proposal.status]?.copy}
          </span>
        </div>
        <div className="w-full flex flex-row mb-5">
          <div className="basis-[38rem] ml-6 mb-2">
            <h2 className="text-xl mt-2 mb-3">{proposal?.data?.content?.title}</h2>
          </div>
          <div className="basis-32 ml-9 mb-2 self-center">
            <p>
              {/* TODO: Figure out how to show signers per milestone */}
              {`${proposal.data?.signatures?.length || "0"} / ${
                rfp?.checkbook?.data?.quorum || "N/A"
              }`}
            </p>
          </div>
          <div className="basis-32 ml-6 mb-2 self-center">
            {proposal.data?.funding?.amount || "N/A"}
          </div>
          <div className="basis-32 ml-2 mb-2 self-center">
            {formatDate(proposal.createdAt) || "N/A"}
          </div>
          <div className="basis-32 ml-6 mr-6 mb-2 self-center">
            {/* TODO: create a flag to indicate the main author when creating an account proposal */}
            <img
              src={proposal?.collaborators[0]?.account?.data?.pfpURL}
              alt="PFP"
              className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.USER
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProposalsTab
