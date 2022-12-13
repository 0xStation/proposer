import { PencilIcon } from "@heroicons/react/solid"
import { ProposalRole, ProposalRoleType, ProposalStatus } from "@prisma/client"
import { Account } from "app/account/types"
import GnosisSafeSignersModal from "app/core/components/GnosisSafeSignersModal"
import { ModuleBox } from "app/core/components/ModuleBox"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { ToolTip } from "app/core/components/ToolTip"
import useGetUsersRoles from "app/core/hooks/useGetUsersRoles"
import { Proposal } from "app/proposal/types"
import { useEffect, useState } from "react"
import { useEditRolesPermissions } from "../hooks/useEditRolesPermissions"
import { useRoles } from "../hooks/useRoles"
import { EditRoleType } from "./EditRoleType"
import { UpdateRolesModal } from "./UpdateRolesModal"
import { ViewRoleType } from "./ViewRoleType"

export const RoleModule = ({
  proposal,
  className = "",
}: {
  proposal?: Proposal
  className: string
}) => {
  const RoleTypeModule = ({
    isView,
    proposal,
    roleType,
    openGnosisSigners,
    accounts,
    setAccounts,
    addedRoles,
    setAddedRoles,
    removedRoles,
    setRemovedRoles,
    className = "",
  }) => {
    const canEditRole = useEditRolesPermissions(proposal?.id, roleType)

    return isView || !canEditRole ? (
      <ViewRoleType
        proposal={proposal}
        roleType={roleType}
        className={className}
        openGnosisSigners={openGnosisSigners}
      />
    ) : (
      <EditRoleType
        proposal={proposal}
        roleType={roleType}
        accounts={accounts}
        setAccounts={setAccounts}
        addedRoles={addedRoles}
        setAddedRoles={setAddedRoles}
        removedRoles={removedRoles}
        setRemovedRoles={setRemovedRoles}
      />
    )
  }

  const { roles } = useRoles(proposal?.id)
  const [selectedRole, setSelectedRole] = useState<ProposalRole | null>()
  const [toggleRoleSigners, setToggleRoleSigners] = useState<boolean>(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false)

  const openGnosisSigners = (role) => {
    setSelectedRole(role)
    setToggleRoleSigners(true)
  }

  const [isView, setIsView] = useState<boolean>(true)

  const { roles: usersRoles } = useGetUsersRoles(proposal?.id)
  const canEdit = usersRoles.length > 0

  const [authorAccounts, setAuthorAccounts] = useState<Account[]>(
    roles?.filter((role) => role.type === ProposalRoleType.AUTHOR)?.map((role) => role.account!) ||
      []
  )
  const [authorAddedRoles, setAuthorAddedRoles] = useState<Account[]>([])
  const [authorRemovedRoles, setAuthorRemovedRoles] = useState<ProposalRole[]>([])

  const [contributorAccounts, setContributorAccounts] = useState<Account[]>(
    roles
      ?.filter((role) => role.type === ProposalRoleType.CONTRIBUTOR)
      ?.map((role) => role.account!) || []
  )
  const [contributorAddedRoles, setContributorAddedRoles] = useState<Account[]>([])
  const [contributorRemovedRoles, setContributorRemovedRoles] = useState<ProposalRole[]>([])

  const [clientAccounts, setClientAccounts] = useState<Account[]>(
    roles?.filter((role) => role.type === ProposalRoleType.CLIENT)?.map((role) => role.account!) ||
      []
  )
  const [clientAddedRoles, setClientAddedRoles] = useState<Account[]>([])
  const [clientRemovedRoles, setClientRemovedRoles] = useState<ProposalRole[]>([])

  const selectNewPaymentRecipient = !proposal?.payments
    ?.map((payment) => payment.recipientAddress)
    ?.filter((v, i, addresses) => addresses.indexOf(v) === i)
    ?.every((address) => contributorAccounts.map((account) => account.address).includes(address))

  const selectNewPaymentSender = !proposal?.payments
    ?.map((payment) => payment.senderAddress)
    ?.filter((v, i, addresses) => addresses.indexOf(v) === i)
    ?.every((address) => clientAccounts.map((account) => account.address).includes(address))

  useEffect(() => {
    setContributorAccounts(
      roles
        ?.filter((role) => role.type === ProposalRoleType.CONTRIBUTOR)
        ?.map((role) => role.account!) || []
    )
    setContributorAddedRoles([])
    setContributorRemovedRoles([])
    setClientAccounts(
      roles
        ?.filter((role) => role.type === ProposalRoleType.CLIENT)
        ?.map((role) => role.account!) || []
    )
    setClientAddedRoles([])
    setClientRemovedRoles([])
    setAuthorAccounts(
      roles
        ?.filter((role) => role.type === ProposalRoleType.AUTHOR)
        ?.map((role) => role.account!) || []
    )
    setAuthorAddedRoles([])
    setAuthorRemovedRoles([])
  }, [roles, isView])

  return (
    <>
      <GnosisSafeSignersModal
        isOpen={toggleRoleSigners}
        setIsOpen={setToggleRoleSigners}
        role={selectedRole}
      />
      <UpdateRolesModal
        proposal={proposal}
        closeEditView={() => {
          setIsView(true)
          setIsSaveModalOpen(false)
        }}
        isOpen={isSaveModalOpen}
        setIsOpen={setIsSaveModalOpen}
        selectNewPaymentRecipient={selectNewPaymentRecipient}
        selectNewPaymentSender={selectNewPaymentSender}
        contributorAccounts={contributorAccounts}
        contributorAddedRoles={contributorAddedRoles}
        contributorRemovedRoles={contributorRemovedRoles}
        clientAccounts={clientAccounts}
        clientAddedRoles={clientAddedRoles}
        clientRemovedRoles={clientRemovedRoles}
        authorAccounts={authorAccounts}
        authorAddedRoles={authorAddedRoles}
        authorRemovedRoles={authorRemovedRoles}
      />
      <ModuleBox isLoading={!roles} className={className}>
        {/* EDIT & SAVE BUTTONS */}
        <div className="relative right-0 float-right">
          {isView ? (
            <div className="group">
              <ToolTip className="mr-1">
                {proposal?.status === ProposalStatus.APPROVED ||
                proposal?.status === ProposalStatus.COMPLETE
                  ? "You cannot edit after the proposal is approved."
                  : !canEdit
                  ? "You do not have permissions to edit."
                  : "Edit"}
              </ToolTip>
              <button
                onClick={() => setIsView(false)}
                disabled={
                  proposal?.status === ProposalStatus.APPROVED ||
                  proposal?.status === ProposalStatus.COMPLETE ||
                  !canEdit
                }
                className="text-marble-white cursor-pointer disabled:text-concrete disabled:cursor-not-allowed"
              >
                <PencilIcon className="h-5 w-5 inline" />
              </button>
            </div>
          ) : (
            <div className="flex flex-row space-x-4 items-center">
              <Button type={ButtonType.Secondary} onClick={() => setIsView(true)}>
                Cancel
              </Button>
              <Button
                type={ButtonType.Primary}
                isDisabled={
                  authorAccounts.length === 0 ||
                  contributorAccounts.length === 0 ||
                  clientAccounts.length === 0 ||
                  (authorAddedRoles.length === 0 &&
                    authorRemovedRoles.length === 0 &&
                    contributorAddedRoles.length === 0 &&
                    contributorRemovedRoles.length === 0 &&
                    clientAddedRoles.length === 0 &&
                    clientRemovedRoles.length === 0)
                }
                onClick={async () => setIsSaveModalOpen(true)}
              >
                Save
              </Button>
            </div>
          )}
        </div>
        {/* CONTRIBUTORS */}
        <RoleTypeModule
          isView={isView}
          proposal={proposal}
          roleType={ProposalRoleType.CONTRIBUTOR}
          openGnosisSigners={openGnosisSigners}
          accounts={contributorAccounts}
          setAccounts={setContributorAccounts}
          addedRoles={contributorAddedRoles}
          setAddedRoles={setContributorAddedRoles}
          removedRoles={contributorRemovedRoles}
          setRemovedRoles={setContributorRemovedRoles}
        />
        <hr className="text-wet-concrete mt-6 mb-4"></hr>
        {/* CLIENTS */}
        <RoleTypeModule
          isView={isView}
          proposal={proposal}
          roleType={ProposalRoleType.CLIENT}
          openGnosisSigners={openGnosisSigners}
          accounts={clientAccounts}
          setAccounts={setClientAccounts}
          addedRoles={clientAddedRoles}
          setAddedRoles={setClientAddedRoles}
          removedRoles={clientRemovedRoles}
          setRemovedRoles={setClientRemovedRoles}
        />
        <hr className="text-wet-concrete mt-6 mb-4"></hr>
        {/* AUTHORS */}
        <RoleTypeModule
          isView={isView}
          proposal={proposal}
          roleType={ProposalRoleType.AUTHOR}
          openGnosisSigners={openGnosisSigners}
          accounts={authorAccounts}
          setAccounts={setAuthorAccounts}
          addedRoles={authorAddedRoles}
          setAddedRoles={setAuthorAddedRoles}
          removedRoles={authorRemovedRoles}
          setRemovedRoles={setAuthorRemovedRoles}
        />
      </ModuleBox>
    </>
  )
}

export default RoleModule
