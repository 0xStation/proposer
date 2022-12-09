import AccountMediaObject from "app/core/components/AccountMediaObject"
import { ModuleBox } from "app/core/components/ModuleBox"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import XIcon from "app/core/icons/XIcon"
import { composeValidators, isEnsOrAddress, requiredField } from "app/utils/validators"
import { Field, Form } from "react-final-form"
import { useRoles } from "../hooks/useRoles"
import { useState } from "react"
import { Account } from "app/account/types"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import createAccount from "app/account/mutations/createAccount"
import { Spinner } from "app/core/components/Spinner"
import useStore from "app/core/hooks/useStore"
import { useResolveEnsAddress } from "app/proposalForm/hooks/useResolveEnsAddress"
import { ProposalRole } from "../types"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { ProposalRoleType } from "@prisma/client"
import { UpdateContributorsModal } from "./UpdateContributorsModal"
import { useRfp } from "app/rfp/hooks/useRfp"
import LockClosedIcon from "app/core/icons/LockClosedIcon"
import { ToolTip } from "app/core/components/ToolTip"
import { AccountPill } from "app/account/components/AccountPill"
import { AddRoleForm } from "./AddRoleForm"
import { useAccountTags } from "../hooks/useAccountTags"

const AccountRow = ({ account, removeAccount, tags = [], lockRemoval }) => {
  return (
    <div className="flex flex-row w-full justify-between mt-4">
      <div className="flex items-center flex-row space-x-2 h-full">
        {/* ACCOUNT */}
        <AccountPill account={account} />
        {/* TAGS */}
        {tags.map((tag, idx) => (
          <span
            className="bg-wet-concrete rounded-full px-2 py-1 flex items-center w-fit text-xs uppercase text-marble-white font-bold"
            key={`tag-${idx}`}
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="group flex flex-row items-center">
        <button
          disabled={lockRemoval}
          className="text-marble-white fill-marble-white disabled:text-concrete disabled:cursor-not-allowed"
          onClick={() => removeAccount(account)}
        >
          {lockRemoval ? <LockClosedIcon /> : <XIcon />}
        </button>
        {lockRemoval && (
          <ToolTip className="absolute right-[-240px] w-64">
            Cannot remove contributors who are added by this proposal&apos;s RFP.
          </ToolTip>
        )}
      </div>
    </div>
  )
}

export const EditRoles = ({ proposal, className, roleType, closeEditView }) => {
  const { roles } = useRoles(proposal?.id)
  const filteredRoles = roles?.filter((role) => role.type === roleType)
  const [isAddingAccount, setIsAddingAccount] = useState<boolean>(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false)

  const setToastState = useStore((state) => state.setToastState)
  const [accounts, setAccounts] = useState<Account[]>(
    filteredRoles?.map((role) => role.account!) || []
  )
  const [addedAccounts, setAddedAccounts] = useState<Account[]>([])
  const [removedRoles, setRemovedRoles] = useState<ProposalRole[]>([])

  const { rfp } = useRfp(proposal?.rfpId)

  const { resolveEnsAddress } = useResolveEnsAddress()

  const addAccount = (account) => {
    setAccounts([...accounts, account])

    const existingRole = filteredRoles?.find((role) =>
      addressesAreEqual(role.address, account.address)
    )
    if (existingRole) {
      setRemovedRoles(
        removedRoles.filter((role) => !addressesAreEqual(role.address, account.address))
      )
    } else {
      setAddedAccounts([...addedAccounts, account])
    }
  }

  const removeAccount = (account) => {
    setAccounts(accounts.filter((a) => a.id !== account.id))

    const existingRole = filteredRoles?.find((role) =>
      addressesAreEqual(role.address, account.address)
    )
    if (existingRole) {
      setRemovedRoles([...removedRoles, existingRole])
    } else {
      setAddedAccounts(addedAccounts.filter((a) => a.id !== account.id))
    }
  }

  let { accountTagsMap } = useAccountTags(proposal, filteredRoles, roleType)

  const selectNewPaymentRecipient =
    roleType === ProposalRoleType.CONTRIBUTOR &&
    !proposal.payments
      .map((payment) => payment.recipientAddress)
      .filter((v, i, addresses) => addresses.indexOf(v) === i)
      .every((address) => accounts.map((account) => account.address).includes(address))

  const selectNewPaymentSender =
    roleType === ProposalRoleType.CLIENT &&
    !proposal.payments
      .map((payment) => payment.senderAddress)
      .filter((v, i, addresses) => addresses.indexOf(v) === i)
      .every((address) => accounts.map((account) => account.address).includes(address))

  return (
    <>
      <UpdateContributorsModal
        proposal={proposal}
        roleType={roleType}
        closeEditView={closeEditView}
        isOpen={isSaveModalOpen}
        setIsOpen={setIsSaveModalOpen}
        selectNewPaymentRecipient={selectNewPaymentRecipient}
        selectNewPaymentSender={selectNewPaymentSender}
        accounts={accounts}
        addedAccounts={addedAccounts}
        removedRoles={removedRoles}
      />
      <ModuleBox isLoading={!roles} className={className}>
        <div className="flex flex-row justify-between items-center mb-4">
          <p className="text-concrete">Editing {roleType.toLowerCase()}s</p>

          <div className="flex flex-row space-x-4 items-center">
            <Button type={ButtonType.Secondary} onClick={() => closeEditView()}>
              Cancel
            </Button>
            <Button
              type={ButtonType.Primary}
              isDisabled={
                accounts.length === 0 || (addedAccounts.length === 0 && removedRoles.length === 0)
              }
              onClick={async () => setIsSaveModalOpen(true)}
            >
              Save
            </Button>
          </div>
        </div>
        {accounts.map((account, idx) => {
          return (
            <AccountRow
              account={account}
              removeAccount={removeAccount}
              tags={accountTagsMap[account.address] || []}
              lockRemoval={
                addressesAreEqual(rfp?.accountAddress, account.address) &&
                rfp?.data?.proposal?.requesterRole === roleType
              }
              key={idx}
            />
          )
        })}
        {accounts.length === 0 && (
          <p className="mx-auto text-md font-bold w-fit pt-[18px]">
            Add at least one {roleType.toLowerCase()}
          </p>
        )}
        <AddRoleForm addAccount={addAccount} />
      </ModuleBox>
    </>
  )
}
