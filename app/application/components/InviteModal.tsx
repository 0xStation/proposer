import { useState, useEffect } from "react"
import Modal from "../../core/components/Modal"
import { useQuery, useMutation } from "blitz"
import Button from "../../core/components/Button"
import getTerminalById from "app/terminal/queries/getTerminalById"
import InviteContributor from "app/application/mutations/inviteContributor"
import useStore from "app/core/hooks/useStore"
import { Account } from "app/account/types"
import { Role } from "app/role/types"
import { titleCase } from "app/core/utils/titleCase"
import getInvitePermissions from "../queries/getInvitePermissions"

export const InviteModal = ({
  selectedApplication,
  currentInitiative,
  isInviteModalOpen,
  setIsInviteModalOpen,
  applicantTicket,
  setRefreshApplications,
}) => {
  const [roleNotSelectedError, setRoleNotSelectedError] = useState<boolean>(false)
  const [inviteSuccessful, setInviteSuccessful] = useState<boolean>(false)
  const [chosenRole, setChosenRole] = useState<Role>()
  const [inviteContributor] = useMutation(InviteContributor)
  const activeUser = useStore((state) => state.activeUser) as Account

  const [invitePermissionedRoleLocalIds] = useQuery(
    getInvitePermissions,
    { terminalId: currentInitiative?.terminalId || 0, inviterId: activeUser?.id },
    { enabled: !!(currentInitiative?.terminalId && activeUser?.id), suspense: false }
  )

  const [terminal] = useQuery(
    getTerminalById,
    { id: currentInitiative?.terminalId || 0 },
    { suspense: false }
  )

  const handleInviteClick = async () => {
    if (!chosenRole && !applicantTicket) {
      // if the applicant isn't an existing ticket holder and a chosenRole isn't selected
      // we show an error because the inviter needs to select a role first.
      setRoleNotSelectedError(true)
    } else {
      await inviteContributor({
        inviterId: activeUser.id,
        accountId: selectedApplication.account.id,
        terminalId: currentInitiative.terminalId,
        // if applicant already holds a ticket we return the same roleLocalId on their ticket
        // and upsert them to the new initiative.
        roleLocalId: chosenRole?.localId || applicantTicket?.roleLocalId,
        initiativeId: currentInitiative.id,
      })
      setInviteSuccessful(true)

      // Remove application from waiting room when applicant is invited.
      // TODO: make it so that applications automatically refreshes via dependency hook
      setRefreshApplications(true)
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
    setChosenRole(role)
  }

  // If an applicant is internally applying to an initiative
  // we don't need to create a new ticket for them and therefore
  // show a different view without a role dropdown.
  const existingTerminalMemberView = (
    <div className="mt-8 mx-12 text-marble-white text-center">
      <h1 className="text-3xl">{`Adding ${selectedApplication?.account?.data?.name} to`}</h1>
      <h1 className="text-3xl">{`${currentInitiative?.data?.name}?`}</h1>
      <Button className="mt-10 mb-3 w-72" onClick={handleInviteClick}>
        Confirm
      </Button>
    </div>
  )

  const newTerminalMemberView = (
    <div className="pt-12 px-1">
      <label className="text-marble-white">Role</label>
      <select
        onChange={handleRoleDropdown}
        className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2 w-full"
      >
        <option value={undefined}>Please select a role:</option>
        {terminal?.roles
          ?.filter((role) => invitePermissionedRoleLocalIds?.includes(role?.localId))
          .reverse()
          .map((role, idx) => (
            <option key={idx} value={role.localId}>
              {titleCase(role.data?.name)}
            </option>
          ))}
      </select>
      <Button className="mt-10 w-72" onClick={handleInviteClick} disabled={roleNotSelectedError}>
        Confirm
      </Button>
      {roleNotSelectedError && <p className="text-torch-red text-center">Please select a role.</p>}
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
          <span className="text-electric-violet">{titleCase(chosenRole?.data.name)}</span> at{" "}
          {terminal?.data?.name} and a part of {currentInitiative?.data?.name}!
        </h1>
      )}
      <p className="mt-3 mb-8">Reach out to let {selectedApplication?.account?.data?.name} know.</p>
    </div>
  )

  const inviteModalView = applicantTicket ? existingTerminalMemberView : newTerminalMemberView
  const title = applicantTicket || inviteSuccessful ? "" : `Add to ${currentInitiative?.data?.name}`
  const subtitle =
    applicantTicket || inviteSuccessful
      ? ""
      : `Select ${selectedApplication?.account?.data?.name}'s starting role at ${terminal?.data?.name}.`
  return (
    <Modal
      title={title}
      subtitle={subtitle}
      open={isInviteModalOpen}
      toggle={(close) => {
        setRoleNotSelectedError(false)
        setIsInviteModalOpen(close)
      }}
      error={roleNotSelectedError}
    >
      {inviteSuccessful ? successfulInvitationView : inviteModalView}
    </Modal>
  )
}

export default InviteModal
