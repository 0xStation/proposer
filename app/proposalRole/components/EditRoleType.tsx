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

export const EditRoleType = ({
  proposal,
  roleType,
  accounts,
  setAccounts,
  addedRoles,
  setAddedRoles,
  removedRoles,
  setRemovedRoles,
}) => {
  const { roles } = useRoles(proposal?.id)
  const filteredRoles = roles?.filter((role) => role.type === roleType)

  const { rfp } = useRfp(proposal?.rfpId)

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
      setAddedRoles([...addedRoles, { type: roleType, address: account.address }])
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
      setAddedRoles(addedRoles.filter((role) => !addressesAreEqual(role.address, account.address)))
    }
  }

  let { accountTagsMap } = useAccountTags(proposal, filteredRoles, roleType)

  return (
    <>
      {/* TITLE */}
      <h4 className="mt-2 text-xs font-bold text-concrete uppercase">
        {roleType.toLowerCase() + "S (EDITING)"}
      </h4>
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
    </>
  )
}
