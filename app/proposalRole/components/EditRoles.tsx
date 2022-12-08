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

const AccountRow = ({ account, removeAccount, tags = [], lockRemoval }) => {
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
  if (roleType === ProposalRoleType.CONTRIBUTOR) {
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
  } else if (roleType === ProposalRoleType.CLIENT) {
    filteredRoles
      ?.map((role) => role.address)
      ?.filter((v, i, addresses) => addresses.indexOf(v) === i)
      ?.forEach((address) => {
        if (
          proposal.payments.some((payment) => addressesAreEqual(payment.senderAddress, address))
        ) {
          accountTagsMap[address] = ["fund sender"]
        }
      })
  }

  const selectNewFundRecipient =
    roleType === ProposalRoleType.CONTRIBUTOR &&
    !proposal.payments
      .map((payment) => payment.recipientAddress)
      .filter((v, i, addresses) => addresses.indexOf(v) === i)
      .every((address) => accounts.map((account) => account.address).includes(address))

  const selectNewFundSender =
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
        selectNewFundRecipient={selectNewFundRecipient}
        selectNewFundSender={selectNewFundSender}
        accounts={accounts}
        addedAccounts={addedAccounts}
        removedRoles={removedRoles}
      />
      <ModuleBox isLoading={!!roles} className={className}>
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
                    className="text-sm font-bold w-56 bg-electric-violet rounded-tr-md rounded-br-md h-10 text-tunnel-black hover:bg-electric-violet/80 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isAddingAccount ? (
                      <div className="flex justify-center items-center">
                        <Spinner fill="black" />
                      </div>
                    ) : (
                      "Add " + roleType.toLowerCase()
                    )}
                  </button>
                </div>
              </form>
            )
          }}
        />
      </ModuleBox>
    </>
  )
}
