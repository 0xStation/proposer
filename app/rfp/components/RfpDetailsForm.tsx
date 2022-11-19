import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import ReadEditMarkdownButton from "app/core/components/ReadEditMarkdownButton"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import TextareaFieldOrMarkdownPreview from "app/core/components/TextareaFieldOrMarkdownPreview"
import WhenFieldChanges from "app/core/components/WhenFieldChanges"
import useStore from "app/core/hooks/useStore"
import { ProposalTemplateFieldValidationName } from "app/template/types"
import { formatPositiveInt, formatTrimLeadingSpace } from "app/utils/formatters"
import React, { useEffect, useState } from "react"
import { Field, Form } from "react-final-form"
import { composeValidators, isPositiveAmount, requiredField } from "../../utils/validators"
import updateRfpContent from "../mutations/updateRfpContent"
import getRfpById from "../queries/getRfpById"

export const RfpDetailsForm = ({ rfp }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [bodyPreviewMode, setBodyPreviewMode] = useState<boolean>(false)
  const [bodyPrefillPreviewMode, setBodyPrefillPreviewMode] = useState<boolean>(false)
  const [wordCountRequirement, setWordCountRequirement] = useState<string>(
    rfp?.data?.proposal?.body?.minWordCount > 0 ? ProposalTemplateFieldValidationName.MIN_WORDS : ""
  )

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
        bodyPrefill: rfp?.data?.proposal?.body?.prefill,
        minWordCount: rfp?.data?.proposal?.body?.minWordCount?.toString() || "",
      }}
      onSubmit={async (values: any, form) => {
        try {
          await updateRfpContentMutation({
            rfpId: rfp?.id,
            title: values?.title,
            body: values.body,
            oneLiner: rfp?.data?.content?.oneLiner,
            bodyPrefill: values.bodyPrefill,
            minWordCount:
              values.wordCountRequirement === ProposalTemplateFieldValidationName.MIN_WORDS
                ? parseInt(values.minWordCount)
                : undefined,
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
            {/* WORD COUNT */}
            <label className="font-bold block mt-6">Word count requirement</label>
            <Field name="wordCountRequirement">
              {({ meta, input }) => (
                <>
                  <div className="custom-select-wrapper">
                    <select
                      {...input}
                      className="w-full bg-wet-concrete rounded p-2 mt-1"
                      value={wordCountRequirement}
                      onChange={(e) => {
                        setWordCountRequirement(e.target.value)
                        // custom values can be compatible with react-final-form by calling
                        // the props.input.onChange callback
                        // https://final-form.org/docs/react-final-form/api/Field
                        input.onChange(e.target.value)
                      }}
                    >
                      <option value="">None</option>
                      <option value={ProposalTemplateFieldValidationName.MIN_WORDS}>Minimum</option>
                    </select>
                  </div>
                </>
              )}
            </Field>
            {wordCountRequirement === ProposalTemplateFieldValidationName.MIN_WORDS && (
              <>
                <span className="text-xs text-concrete">
                  Enter the minimum word count for proposals submitting to this RFP.
                </span>
                <Field
                  name="minWordCount"
                  format={formatPositiveInt}
                  validate={composeValidators(requiredField, isPositiveAmount)}
                >
                  {({ input, meta }) => {
                    return (
                      <div className="h-10 mt-1 w-full bg-wet-concrete text-marble-white mb-5 rounded">
                        <input
                          {...input}
                          type="text"
                          placeholder="0"
                          className="h-full p-2 inline w-full bg-wet-concrete text-marble-white rounded"
                        />
                        {meta.error && meta.touched && (
                          <span className="text-xs text-torch-red mt-2 block">{meta.error}</span>
                        )}
                      </div>
                    )
                  }}
                </Field>
              </>
            )}
            <Button
              type={ButtonType.Secondary}
              isSubmitType={true}
              isDisabled={formState.invalid}
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
