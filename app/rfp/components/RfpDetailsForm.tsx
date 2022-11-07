import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"
import Preview from "app/core/components/MarkdownPreview"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
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
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setBodyPreviewMode(!bodyPreviewMode)
                }}
              >
                {bodyPreviewMode ? (
                  <div className="flex flex-row items-center space-x-1">
                    <p className="inline text-sm text-concrete">Edit</p>{" "}
                    <EyeOffIcon className="inline h-4 w-4 fill-concrete" />
                  </div>
                ) : (
                  <div className="flex flex-row items-center space-x-1">
                    <p className="inline text-sm text-concrete">Read</p>{" "}
                    <EyeIcon className="inline h-4 w-4 fill-concrete" />
                  </div>
                )}
              </button>
            </div>
            {/* TOGGLE */}
            {bodyPreviewMode ? (
              <div className="mt-1 bg-wet-concrete text-marble-white p-2 rounded min-h-[180px] w-full ">
                <Preview markdown={formState.values.body} />
              </div>
            ) : (
              <Field name="body" component="textarea">
                {({ input, meta }) => (
                  <div>
                    <textarea
                      {...input}
                      placeholder="Describe your ideas, detail the value you aim to deliver, and link any relevant documents."
                      className="mt-1 bg-wet-concrete text-marble-white p-2 rounded min-h-[180px] w-full"
                    />
                    {/* this error shows up when the user focuses the field (meta.touched) */}
                    {meta.error && meta.touched && (
                      <span className=" text-xs text-torch-red block">{meta.error}</span>
                    )}
                  </div>
                )}
              </Field>
            )}
            {/* PROPOSAL TEMPLATE */}
            <div className="mt-6 flex flex-row justify-between items-center">
              <label className="font-bold block">Proposal template</label>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setBodyPrefillPreviewMode(!bodyPrefillPreviewMode)
                }}
              >
                {bodyPrefillPreviewMode ? (
                  <div className="flex flex-row items-center space-x-1">
                    <p className="inline text-sm text-concrete">Edit</p>{" "}
                    <EyeOffIcon className="inline h-4 w-4 fill-concrete" />
                  </div>
                ) : (
                  <div className="flex flex-row items-center space-x-1">
                    <p className="inline text-sm text-concrete">Read</p>{" "}
                    <EyeIcon className="inline h-4 w-4 fill-concrete" />
                  </div>
                )}
              </button>
            </div>
            {/* TOGGLE */}
            {bodyPrefillPreviewMode ? (
              <div className="mt-1 bg-wet-concrete text-marble-white p-2 rounded min-h-[180px] w-full">
                <Preview markdown={formState.values.bodyPrefill} />
              </div>
            ) : (
              <Field name="bodyPrefill" component="textarea">
                {({ input, meta }) => (
                  <div>
                    <textarea
                      {...input}
                      placeholder={`# Summary\n\n# Deliverables\n\n# Timeline`}
                      className="mt-1 bg-wet-concrete text-marble-white p-2 rounded min-h-[180px] w-full"
                    />
                    {/* this error shows up when the user focuses the field (meta.touched) */}
                    {meta.error && meta.touched && (
                      <span className=" text-xs text-torch-red block">{meta.error}</span>
                    )}
                  </div>
                )}
              </Field>
            )}
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
