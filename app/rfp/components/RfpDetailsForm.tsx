import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { invalidateQuery, useMutation } from "blitz"
import React from "react"
import { Field, Form } from "react-final-form"
import { requiredField } from "../../utils/validators"
import updateRfpMetadata from "../mutations/updateRfpMetadata"
import getRfpById from "../queries/getRfpById"

export const RfpDetailsForm = ({ rfp }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [updateRfpMetadataMutation] = useMutation(updateRfpMetadata, {
    onSuccess: async (data) => {
      invalidateQuery(getRfpById)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "RFP successfully updated. ",
      })
    },
    onError: (error) => {
      console.error(error)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Error updating RFP.",
      })
    },
  })
  return (
    <Form
      initialValues={{
        title: rfp?.data?.content?.title,
        submissionGuideline: rfp?.data?.content?.submissionGuideline,
      }}
      onSubmit={async (values: any, form) => {
        try {
          await updateRfpMetadataMutation({
            rfpId: rfp?.id,
            status: rfp?.status,
            title: values?.title,
            body: rfp?.data?.content?.body,
            oneLiner: rfp?.data?.content?.oneLiner,
            submissionGuideline: values.submissionGuideline,
            ...(rfp?.data?.singleTokenGate && { singleTokenGate: rfp?.data?.singleTokenGate }),
          })
        } catch (err) {
          console.error(err)
        }
      }}
      render={({ form, handleSubmit }) => {
        const formState = form.getState()

        return (
          <form onSubmit={handleSubmit}>
            <label className="font-bold block mt-6">RFP title*</label>
            <Field name="title" validate={requiredField}>
              {({ meta, input }) => {
                return (
                  <>
                    <input
                      {...input}
                      type="text"
                      required
                      placeholder="Enter ENS name or wallet address"
                      className="bg-wet-concrete rounded mt-2 w-full p-2"
                    />

                    {meta.touched && meta.error && (
                      <span className="text-torch-red text-xs">{meta.error}</span>
                    )}
                  </>
                )
              }}
            </Field>
            <label className="font-bold block mt-6">Submission guidelines</label>
            <Field name="submissionGuideline" component="textarea">
              {({ input, meta }) => (
                <div>
                  <textarea
                    {...input}
                    rows={6}
                    placeholder="Describe your ideas, detail the value you aim to deliver, and link any relevant documents."
                    className="mt-2 bg-wet-concrete text-marble-white p-2 rounded w-full"
                  />
                  {/* this error shows up when the user focuses the field (meta.touched) */}
                  {meta.error && meta.touched && (
                    <span className=" text-xs text-torch-red block">{meta.error}</span>
                  )}
                </div>
              )}
            </Field>
            <Button
              type={ButtonType.Secondary}
              isSubmitType={true}
              isDisabled={formState.pristine}
              className="mt-7"
            >
              Save
            </Button>
          </form>
        )
      }}
    />
  )
}
