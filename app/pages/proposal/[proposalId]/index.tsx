import { BlitzPage, useQuery, useParam } from "blitz"
import { useState } from "react"
import { ExternalLinkIcon } from "@heroicons/react/solid"
import { DateTime } from "luxon"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import getProposalNewById from "app/proposalNew/queries/getProposalNewById"
import getProposalNewSignaturesById from "app/proposalNew/queries/getProposalNewSignaturesById"
import { getNetworkName } from "app/core/utils/networkInfo"
import { ProposalRoleType } from "@prisma/client"
import ApproveProposalNewModal from "app/proposalNew/components/ApproveProposalNewModal"
import ExecutePaymentModal from "app/proposalNew/components/ExecutePaymentModal"
import TransactionLink from "app/core/components/TransactionLink"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import ProgressCircleAndNumber from "app/core/components/ProgressCircleAndNumber"
import MetadataLabel from "app/core/components/MetadataLabel"
import { LINKS, PAYMENT_TERM_MAP } from "app/core/utils/constants"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import Preview from "app/core/components/MarkdownPreview"

export const IpfsViewComponent = ({ ipfsHash, ipfsTimestamp }) => {
  const date = DateTime.fromISO(ipfsTimestamp)
  const formattedDate = date.toFormat("dd-MMM-yyyy HH:mm")
  return (
    <div className="absolute bottom-7 left-6 border border-concrete rounded p-4 bg-tunnel-black">
      <div className="flex flex-col">
        <div className="flex-row border-b border-concrete pb-2">
          <a
            className="inline mr-2 cursor-pointer"
            href={`${LINKS.PINATA_BASE_URL}${ipfsHash}`}
            rel="noreferrer"
          >
            <p className="inline font-bold tracking-wide uppercase text-concrete text-xs">
              Ipfs link
            </p>
            <ExternalLinkIcon className="inline h-4 w-4 fill-concrete cursor-pointer" />
          </a>
          <p className="hidden sm:inline">{ipfsHash}</p>
        </div>
        <div className="flex-row mt-2">
          <p className="inline font-bold tracking-wide uppercase text-concrete text-xs mr-2">
            Last updated
          </p>
          <p className="sm:inline uppercase">{formattedDate}</p>
        </div>
      </div>
    </div>
  )
}

const ViewProposalNew: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const [isApproveProposalModalOpen, setIsApproveProposalModalOpen] = useState<boolean>(false)
  const [isExecutePaymentModalOpen, setIsExecutePaymentModalOpen] = useState<boolean>(false)
  const [isActionPending, setIsActionPending] = useState<boolean>(false)
  const proposalId = useParam("proposalId") as string
  const [proposal] = useQuery(
    getProposalNewById,
    { id: proposalId },
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )

  const proposalContainsPayment = (proposal?.payments && proposal?.payments.length > 0) || false

  const [signatures] = useQuery(
    getProposalNewSignaturesById,
    { proposalId },
    { suspense: false, refetchOnWindowFocus: false, refetchOnReconnect: false }
  )

  const RoleSignature = ({ role }) => {
    const addressHasSigned = (address: string) => {
      return signatures?.some((signature) => addressesAreEqual(address, signature.address)) || false
    }

    return (
      <div className="flex flex-row w-full items-center">
        {role && signatures ? (
          <>
            <AccountMediaObject account={role?.account} />
            <div className="flex flex-row items-center space-x-1 absolute right-10">
              <span
                className={`h-2 w-2 rounded-full bg-${
                  addressHasSigned(role?.address) ? "magic-mint" : "neon-carrot"
                }`}
              />
              <div className="font-bold text-xs uppercase tracking-wider">
                {addressHasSigned(role?.address) ? "signed" : "pending"}
              </div>
            </div>
          </>
        ) : (
          // LOADING STATE
          <div
            tabIndex={0}
            className={`h-10 w-full flex flex-row rounded-4xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
          />
        )}
      </div>
    )
  }

  const userHasRole = proposal?.roles.some((role) =>
    addressesAreEqual(activeUser?.address || "", role.address)
  )
  const userHasSigned = signatures?.some((commitment) =>
    addressesAreEqual(activeUser?.address || "", commitment.address)
  )
  const userIsPayer = proposal?.roles.some(
    (role) =>
      role.role === ProposalRoleType.CLIENT &&
      addressesAreEqual(activeUser?.address || "", role.address)
  )
  const signaturesComplete = (() => {
    const requiredSignatures = {}

    proposal?.roles.forEach((role) => {
      requiredSignatures[role.address] = false
    })

    signatures?.forEach((commitment) => {
      requiredSignatures[commitment.address] = true
    })
    return Object.values(requiredSignatures).every((hasSigned) => hasSigned)
  })()

  const paymentComplete = !!proposal?.payments?.[0]?.transactionHash

  const showApproveButton = userHasRole && !userHasSigned
  const showPayButton =
    proposalContainsPayment && signaturesComplete && userIsPayer && !paymentComplete

  const uniqueRoleAddresses = (proposal?.roles || [])
    .map((role) => toChecksumAddress(role.address))
    .filter((v, i, addresses) => addresses.indexOf(v) === i).length
  const signatureCount = signatures?.length || 0

  return (
    <Layout title="View Proposal">
      <ApproveProposalNewModal
        isOpen={isApproveProposalModalOpen}
        setIsOpen={setIsApproveProposalModalOpen}
        proposal={proposal}
        isSigning={isActionPending}
        setIsSigning={setIsActionPending}
      />
      <ExecutePaymentModal
        isOpen={isExecutePaymentModalOpen}
        setIsOpen={setIsExecutePaymentModalOpen}
        isLoading={isActionPending}
        setIsLoading={setIsActionPending}
        payment={proposal?.payments?.[0]}
      />
      {/* HEADER SECTION */}
      <div className="flex flex-row pl-4 pt-12 pb-20 border-b border-concrete">
        {/* TITLE */}
        <h2 className="ml-6 h-10 text-marble-white text-2xl font-bold w-full">
          {proposal?.data.content.title || " "}
        </h2>
        {/* APPROVE BUTTON */}
        {showApproveButton && (
          <div className="relative self-start group mr-10">
            <Button
              type={ButtonType.Primary}
              isLoading={isActionPending}
              isDisabled={isActionPending}
              onClick={() => {
                setIsApproveProposalModalOpen(true)
              }}
            >
              Approve
            </Button>
          </div>
        )}
        {/* PAY BUTTON */}
        {showPayButton && (
          <div className="relative self-start group mr-10">
            <Button
              type={ButtonType.Primary}
              isLoading={isActionPending}
              isDisabled={isActionPending}
              onClick={() => {
                setIsExecutePaymentModalOpen(true)
              }}
            >
              Pay
            </Button>
          </div>
        )}
      </div>
      {/* BODY SECTION */}
      <div className="h-[calc(100vh-164px)] flex flex-row">
        {/* BODY */}
        <div className="p-10 w-full overflow-y-scroll">
          <Preview markdown={proposal?.data.content.body} />
        </div>
        {/* IPFS */}
        {proposal?.data?.ipfsMetadata?.hash && (
          <IpfsViewComponent
            ipfsHash={proposal?.data?.ipfsMetadata?.hash}
            ipfsTimestamp={proposal?.data?.ipfsMetadata?.timestamp}
          />
        )}
        {/* RIGHT SIDEBAR */}
        <div className="w-[36rem] border-l border-concrete flex-col overflow-y-scroll">
          {/* STATUS */}
          <div className="border-b border-concrete p-6">
            <h4 className="text-xs font-bold text-concrete uppercase">Proposal status</h4>
            {!!proposal ? (
              <div className="flex flex-row space-x-2">
                <p className="mt-2 font-normal">
                  {paymentComplete
                    ? "PAID"
                    : signaturesComplete
                    ? "APPROVED"
                    : "AWAITING SIGNATURES"}
                </p>
                {paymentComplete ? (
                  <TransactionLink
                    className="mt-3"
                    chainId={proposal?.payments?.[0]?.data?.token.chainId}
                    txnHash={proposal?.payments?.[0]?.transactionHash}
                  />
                ) : (
                  <ProgressCircleAndNumber
                    numerator={signatureCount}
                    denominator={uniqueRoleAddresses}
                  />
                )}
              </div>
            ) : (
              // LOADING STATE
              <div
                tabIndex={0}
                className={`h-6 w-48 mt-2 flex flex-row rounded-lg bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
              />
            )}
          </div>
          {/* ROLES */}
          <div className="border-b border-concrete p-6">
            {/* CONTRIBUTOR */}
            <h4 className="text-xs font-bold text-concrete uppercase mb-2">Contributor</h4>
            <RoleSignature
              role={proposal?.roles?.find((role) => role.role === ProposalRoleType.CONTRIBUTOR)}
            />
            {/* CLIENT */}
            <h4 className="text-xs font-bold text-concrete uppercase mb-2 mt-6">Reviewer</h4>
            <RoleSignature
              role={proposal?.roles?.find((role) => role.role === ProposalRoleType.CLIENT)}
            />
            {/* AUTHOR */}
            <h4 className="text-xs font-bold text-concrete uppercase mb-2 mt-6">Author</h4>
            <RoleSignature
              role={proposal?.roles?.find((role) => role.role === ProposalRoleType.AUTHOR)}
            />
          </div>
          {/* TOTAL PAYMENTS */}
          {proposalContainsPayment ? (
            <div className="p-6">
              {/* NETWORK */}
              <h4 className="text-xs font-bold text-concrete uppercase">Network</h4>
              <p className="mt-2 font-normal">
                {getNetworkName(proposal?.data?.totalPayments?.[0]?.token.chainId || 0)}
              </p>
              {/* PAYMENT */}
              <MetadataLabel label="Payment" />
              <p className="mt-2 font-normal">
                {proposal?.data?.totalPayments?.[0]?.amount +
                  " " +
                  proposal?.data?.totalPayments?.[0]?.token.symbol}
              </p>
              {/* PAYMENT TERMS */}
              {proposal?.data?.paymentTerms && (
                <>
                  <MetadataLabel label="Payment terms" />
                  <p className="mt-2 font-normal">
                    {PAYMENT_TERM_MAP[proposal?.data?.paymentTerms]?.copy}
                  </p>
                </>
              )}
            </div>
          ) : proposal ? (
            // EMPTY STATE
            <div className="p-6">
              <p className="text-sm">This proposal contains no payments.</p>
            </div>
          ) : (
            // LOADING STATE
            <></>
          )}
        </div>
      </div>
    </Layout>
  )
}

ViewProposalNew.suppressFirstRenderFlicker = true

export default ViewProposalNew
