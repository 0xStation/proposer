import { useEffect, useState } from "react"
import {
  BlitzPage,
  Routes,
  useParam,
  useQuery,
  Link,
  useRouter,
  invoke,
  GetServerSideProps,
  InferGetServerSidePropsType,
  useRouterQuery,
} from "blitz"
import { trackClick } from "app/utils/amplitude"
import { TRACKING_EVENTS } from "app/core/utils/constants"
import useStore from "app/core/hooks/useStore"
import Layout from "app/core/layouts/Layout"
import Preview from "app/core/components/MarkdownPreview"
import SignApprovalProposalModal from "app/proposal/components/SignApprovalProposalModal"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getRfpById from "app/rfp/queries/getRfpById"
import getCheckbookByProposal from "app/checkbook/queries/getCheckbookByProposal"
import getChecksByProposalId from "app/check/queries/getChecksByProposalId"
import getProposalById from "app/proposal/queries/getProposalById"
import { Check } from "app/check/types"
import { PROPOSAL_STATUS_DISPLAY_MAP } from "app/core/utils/constants"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import truncateString from "app/core/utils/truncateString"
import ProgressIndicator from "app/core/components/ProgressIndicator"
import CashCheckModal from "app/check/components/CashCheckModal"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import networks from "app/utils/networks.json"
import LinkArrow from "app/core/icons/LinkArrow"
import { Spinner } from "app/core/components/Spinner"
import { useWaitForTransaction } from "wagmi"
import useCheckbookFunds from "app/core/hooks/useCheckbookFunds"
import { formatUnits } from "@ethersproject/units"
import {
  PencilIcon,
  DotsHorizontalIcon,
  ClipboardCheckIcon,
  ClipboardIcon,
  LightBulbIcon,
  TrashIcon,
} from "@heroicons/react/solid"
import Dropdown from "app/core/components/Dropdown"
import AddressLink from "app/core/components/AddressLink"
import TextClipboard from "app/core/components/TextClipboard"
import useAdminForTerminal from "app/core/hooks/useAdminForTerminal"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import { RfpStatus } from "app/rfp/types"
import DeleteProposalModal from "app/proposal/components/DeleteProposalModal"
import { ProposalStatus } from "app/proposal/types"
import SuccessProposalModal from "app/proposal/components/SuccessProposalModal"
import SelectCheckbookModal from "app/checkbook/components/SelectCheckbookModal"
import { AddressType } from "@prisma/client"
import { getNetworkName } from "app/core/utils/getNetworkName"
import Button from "app/core/components/sds/buttons/Button"

const {
  PAGE_NAME,
  FEATURE: { PROPOSAL },
} = TRACKING_EVENTS

const ProposalPage: BlitzPage = ({
  rfp,
  proposal,
  terminal,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const activeUser = useStore((state) => state.activeUser)
  const terminalHandle = useParam("terminalHandle") as string
  const setToastState = useStore((state) => state.setToastState)
  const { proposalCreationSuccess } = useRouterQuery()
  const [cashCheckModalOpen, setCashCheckModalOpen] = useState<boolean>(false)
  const [waitingCreation, setWaitingCreation] = useState<boolean>(false)
  const [checkTxnHash, setCheckTxnHash] = useState<string>()
  const [checkbookModalOpen, setCheckbookModalOpen] = useState<boolean>(false)
  const [signModalOpen, setSignModalOpen] = useState<boolean>(false)
  const [deleteProposalModalOpen, setDeleteProposalModalOpen] = useState<boolean>(false)
  const [isProposalUrlCopied, setIsProposalUrlCopied] = useState<boolean>(false)
  const [isSuccessProposalModalOpen, setSuccessProposalModalOpen] = useState<boolean>(false)
  const [check, setCheck] = useState<Check>()
  const isAdmin = useAdminForTerminal(terminal)
  const router = useRouter()

  const [checkbook] = useQuery(
    getCheckbookByProposal,
    { proposalId: proposal?.id as string },
    { suspense: false }
  )

  const [checks] = useQuery(
    getChecksByProposalId,
    { proposalId: proposal?.id as string },
    {
      suspense: false,
      onSuccess: (checks) => {
        if (checkbook && checks[0]?.approvals.length === checkbook.quorum) {
          setCheck(checks[0])
        }
      },
      enabled: !!checkbook,
    }
  )

  useEffect(() => {
    if (proposalCreationSuccess) {
      setSuccessProposalModalOpen(true)
    }
  }, [proposalCreationSuccess])

  useEffect(() => {
    trackClick(PROPOSAL.EVENT_NAME.PROPOSAL_INFO_PAGE_SHOWN, {
      pageName: PAGE_NAME.PROPOSAL_INFO_PAGE,
      userAddress: activeUser?.address,
      stationHandle: terminal?.handle,
      stationId: terminal?.id,
      rfpId: rfp?.id,
      proposalId: proposal?.id,
    })
  }, [])

  const funds = useCheckbookFunds(
    checkbook?.chainId as number,
    checkbook?.address as string,
    checkbook?.quorum as number,
    proposal.data?.funding.token
  )
  const fundsAvailable = formatUnits(funds?.available, funds?.decimals)

  const userIsSigner = checkbook?.signers.includes(activeUser?.address || "")
  const userIsRfpAuthor = rfp.authorAddress === activeUser?.address
  const userIsProposalAuthor =
    proposal?.collaborators?.[0]?.account?.address === activeUser?.address
  const userHasApprovedProposal = proposal.approvals.some(
    (approval) => approval.signerAddress === activeUser?.address
  )
  const proposalHasQuorum = checkbook && check?.approvals?.length === checkbook?.quorum

  // user can edit proposal if they are the author and the proposal is not in review
  const canEditProposal =
    userIsProposalAuthor &&
    (proposal.status === ProposalStatus.SUBMITTED || proposal.status === ProposalStatus.DRAFT) &&
    rfp.status === RfpStatus.OPEN_FOR_SUBMISSIONS

  // user can delete the proposal if they are the author and the proposal hasn't reached quorum.
  // if the user has reached quorum, ideally there should be a voiding process that needs to be
  // approved by both parties.
  const canDeleteProposal = userIsProposalAuthor && proposal.status !== ProposalStatus.APPROVED

  // show approve button, if the proposal hasn't reached quorum, user can approve, user hasn't already approved
  const showApproveButton =
    !userHasApprovedProposal && (userIsRfpAuthor || (userIsSigner && !proposalHasQuorum))
  const showNotSignerWarning = !!checkbook && !userIsSigner

  // proposer has reached quorum and check has not been cashed and user is the proposer
  const showCashButton =
    proposalHasQuorum && !check?.txnHash && check?.recipientAddress === activeUser?.address

  const fundsHaveNotBeenApproved = (proposal) => {
    return proposal.checks.length === 0
  }

  useWaitForTransaction({
    confirmations: 1, // low confirmation count gives us a feel of faster UX
    hash: checkTxnHash,
    enabled: !!checkTxnHash,
    onSuccess: () => {
      try {
        setWaitingCreation(false)
        setCashCheckModalOpen(false)
        // update UI for check status and link
        setCheck(check && { ...check, txnHash: checkTxnHash })
        // clean up
        setCheckTxnHash(undefined)

        setToastState({
          isToastShowing: true,
          type: "success",
          message:
            "Congratulations, the funds have been transferred. Time to execute and deliver! ",
        })
      } catch (e) {
        setWaitingCreation(false)
        console.error(e)
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Cashing check failed.",
        })
      }
    },
  })

  const DeletedView = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
          <h1 className="font-bold text-2xl">Proposal has been deleted</h1>
          <button
            onClick={() => router.push(Routes.ProposalsTab({ terminalHandle, rfpId: rfp?.id }))}
            className="bg-electric-violet text-tunnel-black h-[35px] px-5 rounded hover:opacity-70 mt-5"
          >
            View other proposals
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout title="Proposals">
      {terminal && (
        <SuccessProposalModal
          terminal={terminal}
          rfpId={rfp?.id}
          proposalId={proposal?.id}
          isOpen={isSuccessProposalModalOpen}
          setIsOpen={setSuccessProposalModalOpen}
        />
      )}
      <DeleteProposalModal
        isOpen={deleteProposalModalOpen}
        setIsOpen={setDeleteProposalModalOpen}
        proposal={proposal}
        pageName={PAGE_NAME.PROPOSAL_INFO_PAGE}
        rfpId={rfp?.id}
        terminalHandle={terminalHandle}
        terminalId={terminal?.id as number}
      />
      <SelectCheckbookModal
        isOpen={checkbookModalOpen}
        setIsOpen={setCheckbookModalOpen}
        terminal={terminal}
        proposal={proposal}
      />
      <SignApprovalProposalModal
        isOpen={signModalOpen}
        setIsOpen={setSignModalOpen}
        checkbook={checkbook}
        proposal={proposal}
        checks={checks}
      />
      {check && (
        <CashCheckModal
          isOpen={cashCheckModalOpen}
          setIsOpen={setCashCheckModalOpen}
          waitingCreation={waitingCreation}
          setWaitingCreation={setWaitingCreation}
          tokenSymbol={proposal?.data.funding.symbol || "ETH"} // don't like this as a fallback but currently symbol is not required
          setTxnHash={setCheckTxnHash}
          check={check}
        />
      )}
      <TerminalNavigation>
        {proposal.status !== ProposalStatus.DELETED ? (
          <div className="h-full flex flex-col">
            <div className="border-b border-concrete px-4 pt-4">
              <div className="flex flex-row justify-between">
                <p className="self-center">
                  <span className="text-concrete hover:text-light-concrete">
                    <Link href={Routes.BulletinPage({ terminalHandle })}>Projects</Link> /&nbsp;
                  </span>
                  <span className="text-concrete hover:text-light-concrete">
                    <Link
                      href={Routes.ProposalsTab({
                        terminalHandle,
                        rfpId: rfp?.id,
                      })}
                    >
                      {rfp?.data?.content?.title}
                    </Link>{" "}
                    /&nbsp;
                  </span>
                  {proposal?.data.content.title}
                </p>
              </div>
              <div className="flex flex-row mt-6">
                <div className="flex-col w-full">
                  <div className="flex flex-row space-x-4">
                    <span className=" bg-wet-concrete rounded-full px-2 py-1 flex items-center space-x-1">
                      <LightBulbIcon className="h-4 w-4 text-marble-white" />
                      <span className="text-xs uppercase">Proposal</span>
                    </span>
                    <div className="flex flex-row items-center space-x-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          PROPOSAL_STATUS_DISPLAY_MAP[proposal?.status]?.color || "bg-concrete"
                        }`}
                      />
                      <span className="text-xs uppercase tracking-wider font-bold">
                        {PROPOSAL_STATUS_DISPLAY_MAP[proposal?.status]?.copy}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row w-full mt-3">
                    <div className="flex flex-col w-full">
                      <div className="flex flex-col">
                        <h1 className="text-2xl font-bold">{proposal.data.content.title}</h1>
                        <div className="relative mr-6 mt-2 mb-8">
                          {canEditProposal && (
                            <button
                              onClick={() => {
                                trackClick(PROPOSAL.EVENT_NAME.PROPOSAL_SHOW_EDITOR_CLICKED, {
                                  userAddress: activeUser?.address,
                                  stationHandle: terminalHandle,
                                  stationId: terminal?.id,
                                  isEdit: true,
                                  rfpId: rfp.id,
                                })
                                router.push(
                                  Routes.EditProposalPage({
                                    terminalHandle,
                                    rfpId: rfp.id,
                                    proposalId: proposal.id,
                                  })
                                )
                              }}
                            >
                              <PencilIcon className="inline h-4 w-4 fill-marble-white mr-3 hover:cursor-pointer hover:fill-concrete" />
                            </button>
                          )}
                          {canDeleteProposal ? (
                            <Dropdown
                              className="inline"
                              side="left"
                              button={
                                <DotsHorizontalIcon className="inline-block h-4 w-4 fill-marble-white hover:cursor-pointer hover:fill-concrete" />
                              }
                              items={[
                                {
                                  name: (
                                    <>
                                      {isProposalUrlCopied ? (
                                        <>
                                          <ClipboardCheckIcon className="h-4 w-4 mr-2 inline" />
                                          <p className="inline">Copied!</p>
                                        </>
                                      ) : (
                                        <>
                                          <ClipboardIcon className="h-4 w-4 mr-2 inline" />
                                          <p className="inline">Copy link</p>
                                        </>
                                      )}
                                    </>
                                  ),
                                  onClick: () => {
                                    navigator.clipboard.writeText(window.location.href).then(() => {
                                      setIsProposalUrlCopied(true)
                                      setTimeout(() => setIsProposalUrlCopied(false), 500)
                                    })
                                    setIsProposalUrlCopied(true)
                                  },
                                },
                                {
                                  name: (
                                    <>
                                      <TrashIcon className="h-4 w-4 mr-2 fill-torch-red" />
                                      <p className="text-torch-red">Delete</p>
                                    </>
                                  ),
                                  onClick: () => {
                                    trackClick(
                                      PROPOSAL.EVENT_NAME.PROPOSAL_SETTINGS_DELETE_PROPOSAL_CLICKED,
                                      {
                                        pageName: PAGE_NAME.PROPOSAL_INFO_PAGE,
                                        userAddress: activeUser?.address,
                                        stationHandle: terminalHandle,
                                        stationId: terminal?.id,
                                        rfpId: rfp?.id,
                                        proposalId: proposal?.id,
                                      }
                                    )
                                    setDeleteProposalModalOpen(true)
                                  },
                                },
                              ]}
                            />
                          ) : (
                            <Dropdown
                              className="inline"
                              side="left"
                              button={
                                <DotsHorizontalIcon className="inline-block h-4 w-4 fill-marble-white hover:cursor-pointer hover:fill-concrete" />
                              }
                              items={[
                                {
                                  name: (
                                    <>
                                      {isProposalUrlCopied ? (
                                        <>
                                          <ClipboardCheckIcon className="h-4 w-4 mr-2 inline" />
                                          <p className="inline">Copied!</p>
                                        </>
                                      ) : (
                                        <>
                                          <ClipboardIcon className="h-4 w-4 mr-2 inline" />
                                          <p className="inline">Copy link</p>
                                        </>
                                      )}
                                    </>
                                  ),
                                  onClick: () => {
                                    navigator.clipboard.writeText(window.location.href).then(() => {
                                      setIsProposalUrlCopied(true)
                                      setTimeout(() => setIsProposalUrlCopied(false), 500)
                                    })
                                    setIsProposalUrlCopied(true)
                                  },
                                },
                              ]}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {showApproveButton ? (
                  <div className="relative self-start group">
                    <Button
                      onClick={() => {
                        if (!!checkbook) {
                          setSignModalOpen(true)
                        } else {
                          setCheckbookModalOpen(true)
                        }
                      }}
                      isDisabled={
                        waitingCreation ||
                        (!!checkbook &&
                          parseFloat(fundsAvailable) < proposal.data.funding?.amount) ||
                        (!!checkbook && !userIsSigner)
                      }
                      isLoading={waitingCreation}
                    >
                      Approve
                    </Button>
                    {checkbook &&
                      parseFloat(fundsAvailable) < proposal.data.funding?.amount &&
                      fundsHaveNotBeenApproved(proposal) && (
                        <span className="absolute top-[100%] text-white bg-wet-concrete rounded p-2 text-xs hidden group group-hover:block w-[120%] right-0">
                          Insufficient funds.{" "}
                          {isAdmin && (
                            <span
                              className="text-electric-violet cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault()
                                router.push(Routes.CheckbookSettingsPage({ terminalHandle }))
                              }}
                            >
                              Go to checkbook to refill.
                            </span>
                          )}
                        </span>
                      )}
                    {showNotSignerWarning && (
                      <span className="absolute top-[100%] text-white bg-wet-concrete rounded p-2 text-xs hidden group group-hover:block w-[120%] right-0">
                        You need to be a signer of the associated Checkbook to approve.
                      </span>
                    )}
                  </div>
                ) : showCashButton ? (
                  <button
                    onClick={() => {
                      setCashCheckModalOpen(true)
                    }}
                    className="bg-electric-violet text-tunnel-black px-6 h-[35px] w-48 rounded block mx-auto hover:bg-opacity-70"
                    disabled={waitingCreation}
                  >
                    {waitingCreation ? (
                      <div className="flex justify-center items-center">
                        <Spinner fill="black" />
                      </div>
                    ) : (
                      "Cash check"
                    )}
                  </button>
                ) : null}
              </div>
            </div>
            <div className="grow flex flex-row overflow-y-scroll">
              <div className="p-6 w-full overflow-y-scroll">
                <Preview markdown={proposal?.data.content.body} />
              </div>
              <div className="w-[36rem] border-l border-concrete flex-col overflow-y-scroll">
                <div className="p-6">
                  <h4 className="text-xs font-bold text-concrete uppercase mb-2">Author</h4>
                  {proposal.collaborators.map((collaborator, idx) => {
                    if (collaborator.account?.data) {
                      return <AccountMediaObject account={collaborator.account} />
                    } else {
                      return (
                        <div className="flex flex-row items-center" key={`account-${idx}`}>
                          <img
                            src={DEFAULT_PFP_URLS.USER}
                            alt="PFP"
                            className="w-[32px] h-[32px] rounded-full"
                          />
                          <div className="ml-2">{truncateString(collaborator.address)}</div>
                        </div>
                      )
                    }
                  })}
                  <h4 className="text-xs font-bold text-concrete uppercase mt-6">Station</h4>
                  <div className="flex flex-row items-center mt-2">
                    <img
                      src={rfp?.terminal.data.pfpURL || DEFAULT_PFP_URLS.TERMINAL}
                      alt="PFP"
                      className="w-[40px] h-[40px] rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
                      }}
                    />
                    <div className="ml-2">
                      <span>{rfp?.terminal.data.name}</span>
                      <span className="text-xs text-light-concrete flex">
                        @{rfp?.terminal.handle}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-concrete uppercase mt-6">Project</h4>
                  <span className="flex flex-row items-center group relative w-fit">
                    {rfp?.status !== RfpStatus.DELETED ? (
                      <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: rfp?.id })} passHref>
                        <a target="_blank" rel="noopener noreferrer">
                          <p className="mt-2 text-electric-violet cursor-pointer">
                            {rfp?.data.content.title}
                          </p>
                        </a>
                      </Link>
                    ) : (
                      <>
                        <p className="mt-2 text-electric-violet opacity-70 cursor-not-allowed">
                          {rfp?.data.content.title}
                        </p>
                        <div className="hidden group-hover:block absolute top-[100%] bg-wet-concrete p-2 rounded text-xs w-[140px]">
                          RFP has been deleted.
                        </div>
                      </>
                    )}
                  </span>
                  {/* Network */}
                  <h4 className="text-xs font-bold text-concrete uppercase mt-6">Network</h4>
                  <p className="mt-2 font-normal">
                    {getNetworkName(proposal?.data.funding.chainId)}
                  </p>
                  {/* Token */}
                  <h4 className="text-xs font-bold text-concrete uppercase mt-6">Token</h4>
                  <p className="mt-2 font-normal">{proposal?.data.funding.symbol}</p>
                  {/* Amount */}
                  <h4 className="text-xs font-bold text-concrete uppercase mt-6">
                    Amount Requested
                  </h4>
                  <p className="mt-2">{`${proposal?.data.funding.amount}`}</p>
                  {/* Pay to */}
                  <h4 className="text-xs font-bold text-concrete uppercase mt-6">Pay to</h4>
                  <p className="mt-2">
                    {truncateString(proposal?.data.funding.recipientAddress, 9)}
                  </p>
                </div>
                {checkbook && (
                  <div
                    className={
                      check
                        ? "border-t border-concrete p-6"
                        : "border-t border-concrete p-6 grow flex flex-col justify-between"
                    }
                  >
                    <div>
                      <h4 className="text-xs font-bold text-concrete uppercase">Pay from</h4>
                      <div className="flex flex-col mt-2 content-center">
                        <p className="text-base text-marble-white font-bold">{checkbook.name}</p>
                        <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                          <p className="w-max truncate leading-4 mr-2">
                            {truncateString(checkbook.address)}
                          </p>
                          <AddressLink
                            chainId={checkbook.chainId}
                            address={checkbook.address}
                            className="flex flex-row"
                          />
                          <TextClipboard text={checkbook.address} className="flex flex-row" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h4 className="text-xs font-bold text-concrete uppercase">Approval</h4>
                      <div className="flex flex-row space-x-2 items-center mt-2">
                        <ProgressIndicator
                          percent={proposal?.approvals.length / checkbook?.quorum}
                          twsize={6}
                          cutoff={0}
                        />
                        <p>
                          {proposal?.approvals.length}/{checkbook?.quorum}
                        </p>
                      </div>
                      <div className="mt-6">
                        {proposal?.approvals.length > 0 && (
                          <p className="text-xs text-concrete uppercase font-bold">
                            Approves payment
                          </p>
                        )}
                        {(proposal?.approvals || []).map((approval, i) => (
                          <AccountMediaObject
                            account={approval.signerAccount}
                            className="mt-4"
                            key={i}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {check && (
                  <div className="border-t border-concrete p-6 grow flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-concrete uppercase font-bold">Check</p>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex flex-row items-center">
                          <div>{truncateString(check.recipientAddress)}</div>
                        </div>
                        <div className="flex flex-row items-center space-x-1">
                          <span
                            className={`h-2 w-2 rounded-full bg-${
                              !!check.txnHash ? "magic-mint" : "neon-carrot"
                            }`}
                          />
                          <div className="font-bold text-xs uppercase tracking-wider">
                            {!!check.txnHash ? "cashed" : "pending"}
                          </div>
                          {!!check.txnHash && (
                            <a
                              href={`${networks[check.chainId as number].explorer}/tx/${
                                check.txnHash
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <LinkArrow className="fill-marble-white" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <DeletedView />
        )}
      </TerminalNavigation>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { terminalHandle, rfpId, proposalId } = context.query as {
    terminalHandle: string
    rfpId: string
    proposalId: string
  }
  const rfp = await invoke(getRfpById, { id: rfpId })
  const proposal = await invoke(getProposalById, { id: proposalId })
  const terminal = await invoke(getTerminalByHandle, { handle: terminalHandle })

  if (!rfp || !proposal || !terminal) {
    return {
      redirect: {
        destination: Routes.BulletinPage({ terminalHandle }),
        permanent: false,
      },
    }
  }

  return {
    props: { rfp, proposal, terminal },
  }
}

export default ProposalPage
