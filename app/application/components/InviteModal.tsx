import { useState, useEffect } from "react"
import Modal from "../../core/components/Modal"
import { useQuery, useMutation } from "blitz"
import Button from "../../core/components/Button"
import getTerminalById from "app/terminal/queries/getTerminalById"
import InviteContributor from "app/application/mutations/inviteContributor"
import useStore from "app/core/hooks/useStore"
import { Account } from "app/account/types"
import { Role } from "app/role/types"
import { toTitleCase } from "app/core/utils/titleCase"
import getInvitePermissions from "../queries/getInvitePermissions"
import { useIdentityAdminWrite, useStationIdWrite } from "app/core/contracts/contracts"
import { useWaitForTransaction } from "wagmi"
import { BigNumber } from "ethers"

export const InviteModal = ({
  selectedApplication,
  currentInitiative,
  isInviteModalOpen,
  setIsInviteModalOpen,
  applicantTicket,
  selectedApplicationHasNft,
  refetchApplications,
}) => {
  const [explorerLink, setExplorerLink] = useState<string>()
  const [mintMessage, setMintMessage] = useState<string>("")
  const [error, setError] = useState<boolean>(false)
  const [roleNotSelectedError, setRoleNotSelectedError] = useState<boolean>(false)
  const [inviteSuccessful, setInviteSuccessful] = useState<boolean>(false)
  const [chosenRole, setChosenRole] = useState<Role>()
  const [inviteContributor] = useMutation(InviteContributor)
  const [transactionPending, setTransactionPending] = useState<boolean>(false)
  const activeUser = useStore((state) => state.activeUser) as Account

  useEffect(() => {
    if (applicantTicket) {
      setChosenRole(applicantTicket.role)
    }
  }, [applicantTicket])

  const [invitePermissionedRoleLocalIds] = useQuery(
    getInvitePermissions,
    { terminalId: currentInitiative?.terminalId, inviterId: activeUser?.id },
    { enabled: !!(currentInitiative?.terminalId && activeUser?.id), suspense: false }
  )

  const [terminal] = useQuery(
    getTerminalById,
    { id: currentInitiative?.terminalId },
    { enabled: !!currentInitiative?.terminalId, suspense: false }
  )

  const { loading: mintLoading, write: mint } = useStationIdWrite({
    methodName: "mint",
    contract: terminal?.ticketAddress,
  })

  const [, wait] = useWaitForTransaction({
    skip: true,
  })

  const ViewExplorer = explorerLink && (
    <>
      <a href={explorerLink} target="_blank" className="text-magic-mint" rel="noreferrer">
        Explorer
      </a>
      .
    </>
  )

  const handleExistingMemberInviteClick = async () => {
    await inviteContributor({
      inviterId: activeUser.id,
      accountId: selectedApplication.account.id,
      terminalId: currentInitiative.terminalId,
      // If applicant already holds a ticket we return the same roleLocalId on their ticket
      // and upsert them to the new initiative.
      roleLocalId: chosenRole?.localId || applicantTicket?.roleLocalId,
      initiativeId: currentInitiative.id,
    })

    // Show success modal
    setInviteSuccessful(true)

    // Remove application from waiting room when applicant is invited.
    refetchApplications()
  }

  const handleNewMemberInviteClick = async () => {
    setError(false)
    setRoleNotSelectedError(false)
    setMintMessage("")
    if (!chosenRole && !(applicantTicket && selectedApplicationHasNft)) {
      // If the applicant isn't an existing ticket holder, doesn't have an nft, or a chosenRole isn't selected
      // we show an error because the inviter needs to select a role first.
      setRoleNotSelectedError(true)
    } else {
      // Applicant doesn't already have an nft, we need to mint one
      if (!selectedApplicationHasNft) {
        const { data: mintData, error: mintError } = await mint({
          args: [selectedApplication?.account.address],
        })

        // Poll for on-chain endorse data until we have an error or the results data
        let mintTransaction
        while (!mintTransaction?.data && !mintError) {
          setTransactionPending(true)
          let mintPendingMsg
          if (mintData?.hash) {
            mintPendingMsg = "Mint is pending. View the status on "
            setExplorerLink(`https://rinkeby.etherscan.io/tx/${mintData?.hash}`)
          } else {
            mintPendingMsg = "Mint is pending. Hang tight."
          }
          setMintMessage(mintPendingMsg)
          mintTransaction = await wait({
            hash: mintData?.hash,
          })
        }

        if (mintError) {
          const parsedMintError = JSON.parse(JSON.stringify(mintError))

          if (parsedMintError?.error) {
            setMintMessage(`Something went wrong - ${parsedMintError.error.message}`)
          } else {
            setMintMessage(`Something went wrong - ${parsedMintError.message}`)
          }

          setError(true)
          setTransactionPending(false)
          return
        }

        setTransactionPending(false)
        setMintMessage("")
        setExplorerLink("")
      }

      // upsert new role if user already has an applicant ticket
      await inviteContributor({
        inviterId: activeUser.id as number,
        accountId: selectedApplication.account.id,
        terminalId: currentInitiative.terminalId,
        roleLocalId: chosenRole?.localId || applicantTicket?.roleLocalId,
        initiativeId: currentInitiative.id,
      })

      // Show success modal
      setInviteSuccessful(true)

      // Refetches applications from waiting room when applicant is invited.
      refetchApplications()
    }
  }

  const handleRoleDropdown = (e) => {
    setRoleNotSelectedError(false)
    const roleLocalId = invitePermissionedRoleLocalIds?.find(
      (id) => id === parseInt(e.target.value)
    )
    // Find role name for role's local id. If none exists, set chosen role to `undefined` and set error
    // when user tries to confirm role.
    const role = roleLocalId && terminal?.roles.find((role) => role.localId === roleLocalId)
    setChosenRole(role as Role)
  }

  // If an applicant is internally applying to an initiative
  // we don't need to create a new ticket for them and therefore
  // show a different view without a role dropdown.
  const existingTerminalMemberView = (
    <div className="mt-8 mx-12 text-marble-white text-center">
      <h1 className="text-3xl">{`Adding ${selectedApplication?.account?.data?.name} to`}</h1>
      <h1 className="text-3xl">{`${currentInitiative?.data?.name}?`}</h1>
      <Button className="mt-10 mb-3 w-72" onClick={handleExistingMemberInviteClick}>
        Confirm
      </Button>
    </div>
  )

  const newTerminalMemberView = (
    <div className="pt-12 px-1">
      <label className="text-marble-white">Role</label>
      <select
        value={chosenRole?.localId}
        onChange={handleRoleDropdown}
        className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2 w-full"
      >
        <option value={undefined}>Please select a role:</option>
        {terminal?.roles
          ?.filter((role) => invitePermissionedRoleLocalIds?.includes(role?.localId))
          .reverse()
          .map((role, idx) => (
            <option key={idx} value={role.localId}>
              {toTitleCase(role.data?.name)}
            </option>
          ))}
      </select>
      <Button
        className="mt-10 w-72"
        onClick={handleNewMemberInviteClick}
        loading={mintLoading || transactionPending}
        disabled={roleNotSelectedError || mintLoading || transactionPending}
      >
        Confirm
      </Button>
      {roleNotSelectedError && <p className="text-torch-red text-center">Please select a role.</p>}
      <p
        className={`${
          error ? "text-torch-red" : "text-marble-white"
        } text-center text-base mt-1 mb-[-10px] p-2`}
      >
        {mintMessage}
        {ViewExplorer}
      </p>
    </div>
  )

  const successfulInvitationView = (
    <div className="mt-[2rem] mx-28 text-marble-white text-center">
      {applicantTicket ? (
        <h1 className="text-3xl">
          {selectedApplication?.account?.data?.name} is now part of {currentInitiative?.data?.name}!
        </h1>
      ) : (
        <h1 className="text-3xl">
          {selectedApplication?.account?.data?.name} is now a{" "}
          <span className="text-electric-violet">{toTitleCase(chosenRole?.data.name)}</span> at{" "}
          {terminal?.data?.name} and a part of {currentInitiative?.data?.name}!
        </h1>
      )}
      <p className="mt-3 mb-8">Reach out to let {selectedApplication?.account?.data?.name} know.</p>
    </div>
  )

  const inviteModalView =
    applicantTicket && selectedApplicationHasNft
      ? existingTerminalMemberView
      : newTerminalMemberView
  const title =
    (applicantTicket && selectedApplicationHasNft) || inviteSuccessful
      ? ""
      : `Add to ${currentInitiative?.data?.name}`
  const subtitle =
    (applicantTicket && selectedApplicationHasNft) || inviteSuccessful
      ? ""
      : `Select ${selectedApplication?.account?.data?.name}'s starting role at ${terminal?.data?.name}.`
  return (
    <Modal
      title={title}
      subtitle={subtitle}
      open={isInviteModalOpen}
      toggle={(close) => {
        // tear down modal state when user closes modal
        setRoleNotSelectedError(false)
        setIsInviteModalOpen(close)
        setInviteSuccessful(false)
        setChosenRole(undefined)
        setMintMessage("")
        setError(false)
        setTransactionPending(false)
        setExplorerLink("")
      }}
      error={roleNotSelectedError || error}
    >
      {inviteSuccessful ? successfulInvitationView : inviteModalView}
    </Modal>
  )
}

export default InviteModal
