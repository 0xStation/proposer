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
import { Rfp } from "app/rfp/types"
import { Proposal } from "app/proposal/types"
import { Check } from "app/check/types"
import { PROPOSAL_STATUS_DISPLAY_MAP } from "app/core/utils/constants"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import ProgressIndicator from "app/core/components/ProgressIndicator"
import CashCheckModal from "app/check/components/CashCheckModal"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import networks from "app/utils/networks.json"
import LinkArrow from "app/core/icons/LinkArrow"
import { Spinner } from "app/core/components/Spinner"
import { useWaitForTransaction } from "wagmi"
import { zeroAddress } from "app/core/utils/constants"

type GetServerSidePropsData = {
  rfp: Rfp
  proposal: Proposal
}

const ProposalPage: BlitzPage = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const activeUser = useStore((state) => state.activeUser)
  const terminalHandle = useParam("terminalHandle") as string
  const setToastState = useStore((state) => state.setToastState)
  const [cashCheckModalOpen, setCashCheckModalOpen] = useState<boolean>(false)
  const [waitingCreation, setWaitingCreation] = useState<boolean>(false)
  const [txnHash, setTxnHash] = useState<string>()
  // useful for P0 while we only expect one check
  const [primaryCheck, setPrimaryCheck] = useState<Check>()
  const [tokenName, setTokenName] = useState<string>("ETH")
  const [signModalOpen, setSignModalOpen] = useState<boolean>(false)

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
          address: data.proposal.data.funding.token,
          chainId: data.rfp.checkbook.chainId,
        }),
      })
      const r = await a.json()
      setTokenName(r.data.symbol)
    }
    if (data.proposal.data.funding.token === zeroAddress) {
      setTokenName("ETH")
    } else {
      getTokenData()
    }
  }, [])

  const [checks] = useQuery(
    getChecksByProposalId,
    { proposalId: data.proposal.id as string },
    { suspense: false }
  )

  // show check if it has reached quorum and is ready to be cashed
  if (!primaryCheck) {
    const tmp = data.proposal.checks[0]
    if (!!tmp && (!!tmp.txnHash || tmp.approvals.length >= tmp.checkbook?.quorum)) {
      // if the check has a transaction or quorum approvals, then set it in state to render
      setPrimaryCheck(tmp)
    }
  }

  enum ButtonOption {
    APPROVE = "Approve",
    CASH = "Cash Check",
    HIDDEN = "",
  }

  let buttonOption: ButtonOption
  const hasQuorum = primaryCheck?.approvals.length === data.rfp.checkbook.quorum
  const userCanApprove =
    data.rfp.checkbook.signers.includes(activeUser?.address) &&
    !data.proposal.approvals.some((approval) => approval.signerAddress === activeUser?.address)
  if (!primaryCheck || (!hasQuorum && userCanApprove)) {
    // no check created or the check has not been cashed and is not yet approved
    buttonOption = ButtonOption.APPROVE
  } else if (
    hasQuorum &&
    !primaryCheck.txnHash &&
    primaryCheck.recipientAddress === activeUser?.address
  ) {
    // check created, but not cashed and the current user is the recipient
    buttonOption = ButtonOption.CASH
  } else {
    // check created and cashed OR user is not recipient
    buttonOption = ButtonOption.HIDDEN
  }

  const txn = useWaitForTransaction({
    confirmations: 1, // low confirmation count gives us a feel of faster UX
    hash: txnHash,
    enabled: !!txnHash,
    onSuccess: () => {
      try {
        setWaitingCreation(false)
        setCashCheckModalOpen(false)
        // update UI for check status and link
        setPrimaryCheck(primaryCheck && { ...primaryCheck, txnHash })
        // clean up
        setTxnHash(undefined)

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
        rfp={data.rfp}
        proposal={data.proposal}
        checks={checks}
      />
      {!!primaryCheck && (
        <CashCheckModal
          isOpen={cashCheckModalOpen}
          setIsOpen={setCashCheckModalOpen}
          waitingCreation={waitingCreation}
          setWaitingCreation={setWaitingCreation}
          setTxnHash={setTxnHash}
          check={primaryCheck}
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
                <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: data.rfp.id })}>
                  {`RFP: ${data.rfp?.data?.content?.title}`}
                </Link>{" "}
                /&nbsp;
              </span>
              {data.proposal.data.content.title}
            </p>

            <div className="flex flex-row items-center space-x-2 mt-6">
              <span
                className={`h-2 w-2 rounded-full ${
                  PROPOSAL_STATUS_DISPLAY_MAP[data.proposal.status]?.color || "bg-concrete"
                }`}
              />
              <span className="text-xs uppercase tracking-wider">
                {PROPOSAL_STATUS_DISPLAY_MAP[data.proposal.status]?.copy}
              </span>
            </div>
            <h1 className="mt-6 text-2xl font-bold">{data.proposal.data.content.title}</h1>
            {/* collaborators would go here, but we have not created collaborators yet */}
            <div className="w-full overflow-y-scroll mt-6">
              <Preview markdown={data.proposal.data.content.body} />
            </div>
          </div>
          <div className="col-span-1 h-full border-l border-concrete flex flex-col">
            <div className="border-b border-concrete p-6">
              <h4 className="text-xs font-bold text-concrete uppercase">Terminal</h4>
              <div className="flex flex-row items-center mt-2">
                <img
                  src={data.rfp.terminal.data.pfpURL || DEFAULT_PFP_URLS.TERMINAL}
                  alt="PFP"
                  className="w-[40px] h-[40px] rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
                  }}
                />
                <div className="ml-2">
                  <span>{data.rfp.terminal.data.name}</span>
                  <span className="text-xs text-light-concrete flex">
                    @{data.rfp.terminal.handle}
                  </span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-concrete uppercase mt-6">
                Request for Proposal
              </h4>
              <Link href={Routes.RFPInfoTab({ terminalHandle, rfpId: data.rfp.id })}>
                <p className="mt-2 text-electric-violet cursor-pointer">
                  {data.rfp.data.content.title}
                </p>
              </Link>
              <h4 className="text-xs font-bold text-concrete uppercase mt-6">Total Amount</h4>
              <p className="mt-2 font-normal">{`${data.proposal.data.funding.amount} ${tokenName}`}</p>
              <h4 className="text-xs font-bold text-concrete uppercase mt-6">Fund Recipient</h4>
              <p className="mt-2">{data.proposal.data.funding.recipientAddress}</p>
            </div>
            <div
              className={
                !!primaryCheck
                  ? "border-b border-concrete p-6"
                  : "p-6 grow flex flex-col justify-between"
              }
            >
              <div>
                <h4 className="text-xs font-bold text-concrete uppercase mt-4">Approval</h4>
                <div className="flex flex-row space-x-2 items-center mt-2">
                  <ProgressIndicator
                    percent={data.proposal.approvals.length / data.rfp.checkbook.quorum}
                    twsize={6}
                    cutoff={0}
                  />
                  <p>
                    {data.proposal.approvals.length}/{data.rfp.checkbook.quorum}
                  </p>
                </div>
                <div className="mt-6">
                  {data.proposal.approvals.length > 0 && (
                    <p className="text-xs text-concrete uppercase font-bold">Signers</p>
                  )}
                  {(data.proposal.approvals || []).map((approval, i) => (
                    <AccountMediaObject account={approval.signerAccount} className="mt-4" key={i} />
                  ))}
                </div>
              </div>
            </div>
            {!!primaryCheck && (
              <div className="p-6 grow flex flex-col justify-between">
                <div className="mt-6">
                  <p className="text-xs text-concrete uppercase font-bold">Checks</p>
                  <div className="flex justify-between items-center">
                    <AccountMediaObject account={primaryCheck.recipientAccount} className="mt-4" />
                    <div className="flex flex-row items-center space-x-1">
                      <span
                        className={`h-2 w-2 rounded-full bg-${
                          !!primaryCheck.txnHash ? "magic-mint" : "neon-carrot"
                        }`}
                      />
                      <div className="font-bold text-xs uppercase tracking-wider">
                        {!!primaryCheck.txnHash ? "cashed" : "pending"}
                      </div>
                      {!!primaryCheck.txnHash && (
                        <a
                          href={`${networks[primaryCheck.chainId as number].explorer}/tx/${
                            primaryCheck.txnHash
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
            {buttonOption != ButtonOption.HIDDEN && (
              <button
                type="button"
                onClick={() => {
                  buttonOption == ButtonOption.CASH
                    ? setCashCheckModalOpen(true)
                    : buttonOption == ButtonOption.APPROVE
                    ? setSignModalOpen(true)
                    : () => {}
                }}
                className="bg-electric-violet text-tunnel-black px-6 mb-6 h-10 w-48 rounded block mx-auto hover:bg-opacity-70"
                disabled={waitingCreation}
              >
                {waitingCreation ? (
                  <div className="flex justify-center items-center">
                    <Spinner fill="black" />
                  </div>
                ) : (
                  buttonOption
                )}
              </button>
            )}
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

  const data: GetServerSidePropsData = {
    rfp,
    proposal,
  }

  return {
    props: { data },
  }
}

export default ProposalPage
