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
import updateProposalRoles from "../mutations/updateProposalRoles"
import getRolesByProposalId from "../queries/getRolesByProposalId"
import getProposalById from "app/proposal/queries/getProposalById"

const AccountRow = ({ account, removeAccount, tags = [] }) => {
  return (
    <div className="flex flex-row w-full justify-between mt-4">
      <div className="flex items-center flex-row space-x-2 h-full">
        {/* ACCOUNT */}
        <AccountMediaObject account={account} showActionIcons={true} />
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
      <button className="text-marble-white" onClick={() => removeAccount(account)}>
        <XIcon />
      </button>
    </div>
  )
}

export const EditRoles = ({ proposal, className, editingRole, setIsView }) => {
  const { roles } = useRoles(proposal?.id)
  const filteredRoles = roles?.filter((role) => role.type === editingRole)
  const [isAddingAccount, setIsAddingAccount] = useState<boolean>(false)
  const [isUpdatingRoles, setIsUpdatingRoles] = useState<boolean>(false)
  const setToastState = useStore((state) => state.setToastState)
  const [accounts, setAccounts] = useState<Account[]>(
    filteredRoles?.map((role) => role.account!) || []
  )
  const [addedAccounts, setAddedAccounts] = useState<Account[]>([])
  const [removedRoles, setRemovedRoles] = useState<ProposalRole[]>([])

  const { resolveEnsAddress } = useResolveEnsAddress()
  const [createAccountMutation] = useMutation(createAccount, {
    onSuccess: (account) => {
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
    },
    onError: (error) => {
      console.error(error)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error adding account.",
      })
    },
    onSettled: () => {
      setIsAddingAccount(false)
    },
  })

  const [updateProposalRolesMutation] = useMutation(updateProposalRoles, {
    onSuccess: (roles) => {
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Successfully updated roles.",
      })
      invalidateQuery(getRolesByProposalId)
      invalidateQuery(getProposalById) // resets approval progress denominator
      setIsView(true)
    },
    onError: (error) => {
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error updating roles.",
      })
    },
    onSettled: () => {
      setIsUpdatingRoles(false)
    },
  })

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

  let accountTagsMap = {}
  if (editingRole === ProposalRoleType.CONTRIBUTOR) {
    filteredRoles
      ?.map((role) => role.address)
      ?.filter((v, i, addresses) => addresses.indexOf(v) === i)
      ?.forEach((address) => {
        if (
          proposal.payments.some((payment) => addressesAreEqual(payment.recipientAddress, address))
        ) {
          accountTagsMap[address] = ["fund recipient"]
        }
      })
  }

  return (
    <ModuleBox isLoading={!!roles} className={className}>
      <div className="flex flex-row justify-between items-center mb-4">
        <p className="text-concrete">Editing {editingRole.toLowerCase()}s</p>
        <div className="flex flex-row space-x-4 items-center">
          <Button type={ButtonType.Secondary} onClick={() => setIsView(true)}>
            Cancel
          </Button>
          <Button
            type={ButtonType.Primary}
            isDisabled={
              accounts.length === 0 || (addedAccounts.length === 0 && removedRoles.length === 0)
            }
            onClick={async () => {
              setIsUpdatingRoles(true)
              try {
                await updateProposalRolesMutation({
                  proposalId: proposal?.id,
                  roleType: editingRole,
                  addAddresses: addedAccounts.map((account) => account.address),
                  removeRoleIds: removedRoles.map((role) => role.id),
                })
              } catch (e) {
                console.error(e)
              }
            }}
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
            key={idx}
            tags={accountTagsMap[account.address] || []}
          />
        )
      })}
      {accounts.length === 0 && (
        <p className="mx-auto text-md font-bold w-fit pt-[18px]">Add at least one contributor</p>
      )}
      <Form
        initialValues={{}}
        onSubmit={async (values, form) => {
          console.log("values", values)
          setIsAddingAccount(true)

          const resolvedAddress = await resolveEnsAddress(values.address.trim())
          if (!resolvedAddress) {
            setIsAddingAccount(false)
            setToastState({
              isToastShowing: true,
              type: "error",
              message: "Invalid ENS name or wallet address provided.",
            })
            return
          }

          try {
            await createAccountMutation({
              address: resolvedAddress,
            })
            form.reset()
          } catch (e) {
            console.error(e)
          }
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          return (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-row items-center mt-8">
                <Field name="address" validate={composeValidators(requiredField, isEnsOrAddress)}>
                  {({ meta, input }) => {
                    return (
                      <>
                        <input
                          {...input}
                          type="text"
                          required
                          placeholder="Enter ENS name or wallet address"
                          className="bg-wet-concrete rounded-tl-md rounded-bl-md w-full p-2"
                        />
                        {/* TODO: acting weird with flex-row */}
                        {/* {meta.touched && meta.error && (
                          <span className="text-torch-red text-xs">{meta.error}</span>
                        )} */}
                      </>
                    )
                  }}
                </Field>
                <button
                  type="submit"
                  disabled={formState.invalid || isAddingAccount}
                  className="text-sm w-56 bg-electric-violet rounded-tr-md rounded-br-md h-10 text-tunnel-black hover:bg-electric-violet/80 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAddingAccount ? (
                    <div className="flex justify-center items-center">
                      <Spinner fill="black" />
                    </div>
                  ) : (
                    "Add " + editingRole.toLowerCase()
                  )}
                </button>
              </div>
            </form>
          )
        }}
      />
    </ModuleBox>
  )
}
