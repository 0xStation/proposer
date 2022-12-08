import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { ProposalRoleType } from "@prisma/client"
import Modal from "app/core/components/Modal"
import Button from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import getProposalById from "app/proposal/queries/getProposalById"
import { requiredField } from "app/utils/validators"
import { useState } from "react"
import { Field, Form } from "react-final-form"
import updateProposalContributors from "../mutations/updateProposalContributors"
import getRolesByProposalId from "../queries/getRolesByProposalId"

export const UpdateContributorsModal = ({
  proposal,
  roleType,
  closeEditView,
  isOpen,
  setIsOpen,
  selectNewFundRecipient,
  selectNewFundSender,
  accounts,
  addedAccounts,
  removedRoles,
}) => {
  const setToastState = useStore((state) => state.setToastState)
  const [isUpdatingRoles, setIsUpdatingRoles] = useState<boolean>(false)
  const [updateProposalContributorsMutation] = useMutation(updateProposalContributors, {
    onSuccess: (roles) => {
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Successfully updated roles.",
      })
      invalidateQuery(getRolesByProposalId)
      invalidateQuery(getProposalById) // resets approval progress denominator
      closeEditView()
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

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Save changes to contributors</h1>
        <p className="text-base mt-6">
          Just as a heads up, since this proposal is already published, all other collaborators and
          signers will need to review the new version and re-sign the proposal.
        </p>
        <Form
          initialValues={{}}
          onSubmit={async (values) => {
            setIsUpdatingRoles(true)
            try {
              await updateProposalContributorsMutation({
                proposalId: proposal?.id,
                roleType,
                addAddresses: addedAccounts.map((account) => account.address),
                removeRoleIds: removedRoles.map((role) => role.id),
                newFundRecipient: !!values.newFundRecipient ? values.newFundRecipient : undefined,
                newFundSender: !!values.newFundSender ? values.newFundSender : undefined,
              })
            } catch (e) {
              console.error(e)
            }
          }}
          render={({ form, handleSubmit }) => {
            const formState = form.getState()
            return (
              <form onSubmit={handleSubmit}>
                {selectNewFundRecipient && (
                  <>
                    {/* FUND RECIPIENT */}
                    <label className="font-bold block mt-6">Select a new fund recipient*</label>
                    <p className="text-concrete text-sm">Who will be receiving the funds?</p>
                    <Field name="newFundRecipient" validate={requiredField}>
                      {({ meta, input }) => (
                        <>
                          <div className="custom-select-wrapper">
                            <select {...input} className="w-full bg-wet-concrete rounded p-2 mt-1">
                              <option value="">Select one</option>
                              {accounts.map((account, idx) => (
                                <option value={account.address} key={idx}>
                                  {account.address}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </Field>
                  </>
                )}
                {selectNewFundSender && (
                  <>
                    {/* FUND SENDER */}
                    <label className="font-bold block mt-6">Select a new fund sender*</label>
                    <p className="text-concrete text-sm">Who will be sending the funds?</p>
                    <Field name="newFundSender" validate={requiredField}>
                      {({ meta, input }) => (
                        <>
                          <div className="custom-select-wrapper">
                            <select {...input} className="w-full bg-wet-concrete rounded p-2 mt-1">
                              <option value="">Select one</option>
                              {accounts.map((account, idx) => (
                                <option value={account.address} key={idx}>
                                  {account.address}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </Field>
                  </>
                )}
                <Button
                  isSubmitType={true}
                  isDisabled={formState.invalid || isUpdatingRoles}
                  className="float-right my-8"
                >
                  Save
                </Button>
              </form>
            )
          }}
        />
      </div>
    </Modal>
  )
}
