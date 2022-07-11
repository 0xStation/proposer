import { useEffect, useState } from "react"
import {
  BlitzPage,
  Routes,
  useParam,
  useQuery,
  Link,
  invoke,
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "blitz"
import useStore from "app/core/hooks/useStore"
import Layout from "app/core/layouts/Layout"
import Preview from "app/core/components/MarkdownPreview"
import SignApprovalProposalModal from "app/proposal/components/SignApprovalProposalModal"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getRfpById from "app/rfp/queries/getRfpById"
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
import { ZERO_ADDRESS } from "app/core/utils/constants"
import useCheckbookFunds from "app/core/hooks/useCheckbookFunds"
import { formatUnits } from "ethers/lib/utils"

const ProposalPage: BlitzPage = ({
  rfp,
  proposal,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const activeUser = useStore((state) => state.activeUser)
  const terminalHandle = useParam("terminalHandle") as string
  const setToastState = useStore((state) => state.setToastState)
  const [cashCheckModalOpen, setCashCheckModalOpen] = useState<boolean>(false)
  const [waitingCreation, setWaitingCreation] = useState<boolean>(false)
  const [checkTxnHash, setCheckTxnHash] = useState<string>()
  const [tokenSymbol, setTokenSymbol] = useState<string>("ETH")
  const [signModalOpen, setSignModalOpen] = useState<boolean>(false)
  const [check, setCheck] = useState<Check>()

  // not really a fan of this but we need to get the token symbol
  // should we just store that alongside proposal so we don't have to call this function anytime we need the symbol?
  useEffect(() => {
    const getTokenData = async () => {
      const a = await fetch("/api/fetch-token-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: proposal?.data.funding.token,
          chainId: rfp?.checkbook.chainId,
        }),
      })
      const r = await a.json()
      setTokenSymbol(r.data.symbol)
    }
    if (proposal?.data.funding.token === ZERO_ADDRESS) {
      setTokenSymbol("ETH")
    } else {
      getTokenData()
    }
  }, [])

  const [checks] = useQuery(
    getChecksByProposalId,
    { proposalId: proposal?.id as string },
    {
      suspense: false,
      onSuccess: (checks) => {
        if (checks[0]?.approvals.length === rfp.checkbook.quorum) {
          setCheck(checks[0])
        }
      },
    }
  )

  const funds = useCheckbookFunds(
    rfp.checkbook?.chainId as number,
    rfp.checkbook?.address as string,
    rfp.checkbook?.quorum as number,
    proposal.data?.funding.token
  )
  const fundsAvailable = formatUnits(funds?.available, funds?.decimals)

  const hasQuorum = check?.approvals?.length === rfp?.checkbook.quorum

  // user can approve if they are a signer and they haven't approved before
  const userCanApprove =
    rfp?.checkbook.signers.includes(activeUser?.address) &&
    !proposal.approvals.some((approval) => approval.signerAddress === activeUser?.address)

  // show approve button, if there the proposal hasn't reached quorum, user can approve, user hasn't already approved
  const showApproveButton =
    !hasQuorum && userCanApprove && parseFloat(fundsAvailable) < proposal.data.funding?.amount

  // proposer has reached quorum and check has not been cashed and user is the proposer
  const showCashButton =
    hasQuorum && !check?.txnHash && check?.recipientAddress === activeUser?.address

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

  return (
    <Layout title={`Proposals`}>
      <SignApprovalProposalModal
        isOpen={signModalOpen}
        setIsOpen={setSignModalOpen}
        rfp={rfp}
        proposal={proposal}
        checks={checks}
      />
      {check && (
        <CashCheckModal
          isOpen={cashCheckModalOpen}
          setIsOpen={setCashCheckModalOpen}
          waitingCreation={waitingCreation}
          setWaitingCreation={setWaitingCreation}
          tokenSymbol={tokenSymbol}
          setTxnHash={setCheckTxnHash}
          check={check}
        />
      )}
      <TerminalNavigation>
        <div className="grid grid-cols-3 h-screen w-full box-border">
          <div className="col-span-2 p-6">
            <p className="self-center">
              <span className="text-concrete hover:text-light-concrete">
                <Link href={Routes.BulletinPage({ terminalHandle })}>Bulletin</Link> /&nbsp;
              </span>
              <span className="text-concrete hover:text-light-concrete">
                <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: rfp?.id })}>
                  {`RFP: ${rfp?.data?.content?.title}`}
                </Link>{" "}
                /&nbsp;
              </span>
              {proposal?.data.content.title}
            </p>

            <div className="flex flex-row items-center space-x-2 mt-6">
              <span
                className={`h-2 w-2 rounded-full ${
                  PROPOSAL_STATUS_DISPLAY_MAP[proposal?.status]?.color || "bg-concrete"
                }`}
              />
              <span className="text-xs uppercase tracking-wider font-bold">
                {PROPOSAL_STATUS_DISPLAY_MAP[proposal?.status]?.copy}
              </span>
            </div>
            <h1 className="mt-6 text-2xl font-bold mb-2">{proposal.data.content.title}</h1>
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
                    <div className="ml-2">{truncateString(collaborator.account)}</div>
                  </div>
                )
              }
            })}

            <div className="w-full overflow-y-scroll mt-6">
              <Preview markdown={proposal?.data.content.body} />
            </div>
          </div>
          <div className="col-span-1 h-full border-l border-concrete flex flex-col">
            <div className="border-b border-concrete p-6">
              <h4 className="text-xs font-bold text-concrete uppercase">Terminal</h4>
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
                  <span className="text-xs text-light-concrete flex">@{rfp?.terminal.handle}</span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-concrete uppercase mt-6">
                Request for Proposal
              </h4>
              <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: rfp?.id })} passHref>
                <a target="_blank" rel="noopener noreferrer">
                  <p className="mt-2 text-electric-violet cursor-pointer">
                    {rfp?.data.content.title}
                  </p>
                </a>
              </Link>
              <h4 className="text-xs font-bold text-concrete uppercase mt-6">Total Amount</h4>
              <p className="mt-2 font-normal">{`${proposal?.data.funding.amount} ${tokenSymbol}`}</p>
              <h4 className="text-xs font-bold text-concrete uppercase mt-6">Fund Recipient</h4>
              <p className="mt-2">{proposal?.data.funding.recipientAddress}</p>
            </div>
            <div
              className={
                check ? "border-b border-concrete p-6" : "p-6 grow flex flex-col justify-between"
              }
            >
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase mt-4">Approval</h4>
                <div className="flex flex-row space-x-2 items-center mt-2">
                  <ProgressIndicator
                    percent={proposal?.approvals.length / rfp?.checkbook.quorum}
                    twsize={6}
                    cutoff={0}
                  />
                  <p>
                    {proposal?.approvals.length}/{rfp?.checkbook.quorum}
                  </p>
                </div>
                <div className="mt-6">
                  {proposal?.approvals.length > 0 && (
                    <p className="text-xs text-concrete uppercase font-bold">Signers</p>
                  )}
                  {(proposal?.approvals || []).map((approval, i) => (
                    <AccountMediaObject account={approval.signerAccount} className="mt-4" key={i} />
                  ))}
                </div>
              </div>
            </div>
            {check && (
              <div className="p-6 grow flex flex-col justify-between">
                <div className="mt-6">
                  <p className="text-xs text-concrete uppercase font-bold">Check</p>
                  <div className="flex justify-between items-center">
                    <AccountMediaObject account={check.recipientAccount} className="mt-4" />

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
                          href={`${networks[check.chainId as number].explorer}/tx/${check.txnHash}`}
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
            {showApproveButton ? (
              <button
                onClick={() => {
                  setSignModalOpen(true)
                }}
                className="bg-electric-violet text-tunnel-black px-6 mb-6 h-10 w-48 rounded block mx-auto hover:bg-opacity-70"
                disabled={waitingCreation}
              >
                {waitingCreation ? (
                  <div className="flex justify-center items-center">
                    <Spinner fill="black" />
                  </div>
                ) : (
                  "Approve"
                )}
              </button>
            ) : showCashButton ? (
              <button
                onClick={() => {
                  setCashCheckModalOpen(true)
                }}
                className="bg-electric-violet text-tunnel-black px-6 mb-6 h-10 w-48 rounded block mx-auto hover:bg-opacity-70"
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

  if (!rfp || !proposal) {
    return {
      redirect: {
        destination: Routes.BulletinPage({ terminalHandle }),
        permanent: false,
      },
    }
  }

  return {
    props: { rfp, proposal },
  }
}

export default ProposalPage
