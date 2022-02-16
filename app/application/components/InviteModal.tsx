import { useState } from "react"
import Modal from "../../core/components/Modal"
import { useQuery } from "blitz"
import Button from "../../core/components/Button"
import getRolesByTerminal from "app/role/queries/getRolesByTerminal"
import getTerminalById from "app/terminal/queries/getTerminalById"

export const InviteModal = ({
  selectedApplication,
  currentInitiative,
  isInviteModalOpen,
  setIsInviteModalOpen,
  applicantTicket,
}) => {
  const [inviteSuccessful, setInviteSuccessful] = useState<boolean>(false)
  const [role, setRole] = useState<string>()

  const [roles] = useQuery(
    getRolesByTerminal,
    { terminalId: currentInitiative?.terminalId || 0 },
    { suspense: false }
  )

  const [terminal] = useQuery(
    getTerminalById,
    { id: currentInitiative?.terminalId || 0 },
    { suspense: false }
  )

  const handleInvite = () => {
    if (!role && Array.isArray(roles) && roles.length) {
      setRole(roles[0]?.data.name)
    }

    // TODO: add mutation here

    setInviteSuccessful(true)
  }

  const handleRoleDropdown = (e) => {
    setRole(e.target.value)
  }

  // If an applicant is internally applying to an initiative
  // we don't need to create a new ticket for them and therefore
  // don't need a role dropdown.
  const existingTerminalMemberView = (
    <div className="mt-8 mx-12 text-marble-white text-center">
      <h1 className="text-3xl">{`Adding ${selectedApplication?.account?.data?.name} to`}</h1>
      <h1 className="text-3xl">{`${currentInitiative?.data?.name}?`}</h1>
      <Button className="mt-10 mb-3 w-72" onClick={handleInvite}>
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
        {roles?.map(({ data }, idx) => (
          <option key={idx} value={data?.value}>
            {data?.name}
          </option>
        ))}
      </select>
      <Button className="mt-10 w-72" onClick={handleInvite}>
        Invite
      </Button>
    </div>
  )

  const successfulInvitationView = (
    <div className="mt-[3.25rem] mx-12 text-marble-white text-center">
      <h1 className="text-3xl">{`${selectedApplication?.account?.data?.name} is now a ${role} at ${terminal?.data?.name} and a part of ${currentInitiative?.data?.name}! `}</h1>
      <p className="mt-3 mb-8">{`Reach out to let ${selectedApplication?.account?.data?.name} know.`}</p>
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
        setIsInviteModalOpen(close)
      }}
    >
      {inviteSuccessful ? successfulInvitationView : inviteModalView}
    </Modal>
  )
}

export default InviteModal
