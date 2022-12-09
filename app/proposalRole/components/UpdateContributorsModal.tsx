import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { ProposalRoleType } from "@prisma/client"
import Modal from "app/core/components/Modal"
import Button from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import getProposalById from "app/proposal/queries/getProposalById"
import { ParticipantDiff } from "app/proposalVersion/components/ParticipantDiff"
import getProposalVersionsByProposalId from "app/proposalVersion/queries/getProposalVersionsByProposalId"
import { ChangeParticipantType } from "app/proposalVersion/types"
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
  selectNewPaymentRecipient,
  selectNewPaymentSender,
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
      invalidateQuery(getProposalVersionsByProposalId) // renders new history item
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

  const participantsDiff = [
    ...removedRoles.map((role) => {
      return {
        address: role.address,
        roleType,
        changeType: ChangeParticipantType.REMOVED,
      }
    }),
    ...addedAccounts.map((account) => {
      return {
        address: account.address,
        roleType,
        changeType: ChangeParticipantType.ADDED,
      }
    }),
  ]

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Save changes</h1>
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
                newPaymentRecipient: !!values.newPaymentRecipient
                  ? values.newPaymentRecipient
                  : undefined,
                newPaymentSender: !!values.newPaymentSender ? values.newPaymentSender : undefined,
                changeNotes: values.changeNotes,
              })
            } catch (e) {
              console.error(e)
            }
          }}
          render={({ form, handleSubmit }) => {
            const formState = form.getState()
            return (
              <form onSubmit={handleSubmit}>
                {selectNewPaymentRecipient && (
                  <>
                    {/* FUND RECIPIENT */}
                    <label className="font-bold block mt-6">Select a new payment recipient*</label>
                    <p className="text-concrete text-sm">Who will be receiving the payment?</p>
                    <Field name="newPaymentRecipient" validate={requiredField}>
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
                {selectNewPaymentSender && (
                  <>
                    {/* FUND SENDER */}
                    <label className="font-bold block mt-6">Select a new payer*</label>
                    <p className="text-concrete text-sm">Who will be sending the payment?</p>
                    <Field name="newPaymentSender" validate={requiredField}>
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
                <label className="mt-6 font-bold block">Change notes</label>
                <Field component="textarea" name="changeNotes">
                  {({ input, meta }) => (
                    <div>
                      <textarea
                        {...input}
                        placeholder="Describe the changes you made."
                        className="mt-1 bg-wet-concrete text-marble-white p-2 rounded min-h-[112px] w-full"
                      />
                      {meta.error && meta.touched && (
                        <span className=" text-xs text-torch-red block">{meta.error}</span>
                      )}
                    </div>
                  )}
                </Field>
                <ParticipantDiff participants={participantsDiff} />
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
