import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import ReadEditMarkdownButton from "app/core/components/ReadEditMarkdownButton"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import TextareaFieldOrMarkdownPreview from "app/core/components/TextareaFieldOrMarkdownPreview"
import useStore from "app/core/hooks/useStore"
import { getBodyPrefill } from "app/template/utils"
import { formatTrimLeadingSpace } from "app/utils/formatters"
import React, { useState } from "react"
import { Field, Form } from "react-final-form"
import { requiredField } from "../../utils/validators"
import updateRfpContent from "../mutations/updateRfpContent"
import getRfpById from "../queries/getRfpById"

export const RfpDetailsForm = ({ rfp }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [bodyPreviewMode, setBodyPreviewMode] = useState<boolean>(false)
  const [bodyPrefillPreviewMode, setBodyPrefillPreviewMode] = useState<boolean>(false)
  const [updateRfpContentMutation] = useMutation(updateRfpContent, {
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
        body: rfp?.data?.content?.body,
        bodyPrefill: getBodyPrefill(rfp?.template?.data?.fields),
      }}
      onSubmit={async (values: any, form) => {
        try {
          await updateRfpContentMutation({
            rfpId: rfp?.id,
            title: values?.title,
            body: values.body,
            bodyPrefill: values.bodyPrefill,
            oneLiner: rfp?.data?.content?.oneLiner,
          })
        } catch (err) {
          console.error(err)
        }
      }}
      render={({ form, handleSubmit }) => {
        const formState = form.getState()

        return (
          <form onSubmit={handleSubmit}>
            <label className="font-bold block mt-6">Title*</label>
            <Field name="title" validate={requiredField} format={formatTrimLeadingSpace}>
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
            {/* SUBMISSION GUIDELINES */}
            <div className="mt-6 flex flex-row justify-between items-center">
              <label className="font-bold block">Submission guidelines</label>
              <ReadEditMarkdownButton
                previewMode={bodyPreviewMode}
                setPreviewMode={setBodyPreviewMode}
              />
            </div>
            {/* TOGGLE */}
            <TextareaFieldOrMarkdownPreview
              previewMode={bodyPreviewMode}
              setPreviewMode={setBodyPreviewMode}
              markdown={formState.values.body}
              placeholder="Describe your ideas, detail the value you aim to deliver, and link any relevant documents."
              fieldName="body"
            />
            {/* PROPOSAL TEMPLATE */}
            <div className="mt-6 flex flex-row justify-between items-center">
              <label className="font-bold block">Proposal template</label>
              <ReadEditMarkdownButton
                previewMode={bodyPrefillPreviewMode}
                setPreviewMode={setBodyPrefillPreviewMode}
              />
            </div>
            {/* TOGGLE */}
            <TextareaFieldOrMarkdownPreview
              previewMode={bodyPrefillPreviewMode}
              setPreviewMode={setBodyPrefillPreviewMode}
              markdown={formState.values.bodyPrefill}
              placeholder={`# Summary\n\n# Deliverables\n\n# Timeline`}
              fieldName="bodyPrefill"
            />
            <Button
              type={ButtonType.Secondary}
              isSubmitType={true}
              isDisabled={!formState.valid || formState.pristine}
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
