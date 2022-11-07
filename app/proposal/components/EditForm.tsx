import React, { useState } from "react"
import { Field, Form } from "react-final-form"
import { useRouter } from "next/router"
import { Routes, useParam } from "@blitzjs/next"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"
import { requiredField } from "app/utils/validators"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import Preview from "app/core/components/MarkdownPreview"
import getProposalById from "../queries/getProposalById"
import updateProposalMetadata from "../mutations/updateProposalMetadata"
import useStore from "app/core/hooks/useStore"

export const EditForm = () => {
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const setToastState = useStore((state) => state.setToastState)
  const router = useRouter()
  const proposalId = useParam("proposalId")
  const [proposal] = useQuery(
    getProposalById,
    { id: proposalId as string },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      enabled: Boolean(proposalId),
      staleTime: 500,
    }
  )
  const [updateProposalMetadataMutation] = useMutation(updateProposalMetadata, {
    onSuccess: (data) => {
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Successfully updated your proposal.",
      })
    },
  })
  return (
    <Form
      initialValues={{
        title: proposal?.data?.content?.title,
        body: proposal?.data?.content?.body,
      }}
      onSubmit={async (values: any, form) => {
        const { title, body } = values
        const proposalMetadata = JSON.parse(JSON.stringify(proposal?.data || {}))
        try {
          await updateProposalMetadataMutation({
            proposalId: proposal?.id as string,
            contentTitle: title,
            contentBody: body,
            proposalHash: proposalMetadata?.proposalHash,
            authorSignature: proposalMetadata.authorSignature,
            signatureMessage: proposalMetadata.signatureMessage,
            totalPayments: proposalMetadata?.totalPayments,
            paymentTerms: proposalMetadata?.paymentTerms,
            advancePaymentPercentage: proposalMetadata?.advancePaymentPercentage,
          })
        } catch (err) {
          console.error("Error editing a proposal", err)
          setToastState({
            isToastShowing: true,
            type: "error",
            message: "Sorry something went wrong: failed to edit a proposal.",
          })
        }
      }}
      render={({ form, handleSubmit }) => {
        const formState = form.getState()

        return (
          <form onSubmit={handleSubmit} className="pt-8 px-8 w-full">
            <div className="flex flex-row items-center justify-end w-full">
              <button
                type="button"
                className="pt-1 mr-3"
                onClick={(e) => {
                  e.preventDefault()
                  setPreviewMode(!previewMode)
                }}
              >
                {previewMode ? (
                  <>
                    <p className="inline text-marble-white">Edit</p>{" "}
                    <EyeOffIcon className="inline h-5 w-5 fill-marble-white" />
                  </>
                ) : (
                  <>
                    <p className="inline text-marble-white mr-1">Preview</p>{" "}
                    <EyeIcon className="inline h-5 w-5 fill-marble-white" />
                  </>
                )}
              </button>
              <Button
                type={ButtonType.Secondary}
                className="mx-2"
                onClick={() =>
                  router.push(Routes.ViewProposal({ proposalId: proposalId as string }))
                }
              >
                Cancel
              </Button>
              <Button isSubmitType={true} isDisabled={!formState.dirty}>
                Save changes
              </Button>
            </div>
            <div className="lg:mx-80 md:mx-48 sm:mx-24 mt-3">
              <div className="mb-8">
                <label className="tracking-wider font-bold text-concrete mb-3">Title</label>
                {previewMode ? (
                  <div className="mt-1 bg-tunnel-black text-marble-white w-full">
                    <Preview markdown={formState.values.title} />
                  </div>
                ) : (
                  <Field name="title" validate={requiredField}>
                    {({ input, meta }) => (
                      <div>
                        <input
                          {...input}
                          className="mt-1 bg-tunnel-black text-marble-white w-full"
                        />
                        {/* this error shows up when the user focuses the field (meta.touched) */}
                        {meta.error && meta.touched && (
                          <span className="text-xs text-torch-red block">{meta.error}</span>
                        )}
                      </div>
                    )}
                  </Field>
                )}
              </div>
              <div>
                <label className="tracking-wider font-bold text-concrete mb-3">Content</label>
                {previewMode ? (
                  <div className="mt-1 bg-tunnel-black text-marble-white w-full">
                    <Preview markdown={formState.values.body} />
                  </div>
                ) : (
                  <Field name="body" validate={requiredField}>
                    {({ input, meta }) => (
                      <div>
                        <input
                          {...input}
                          className="mt-1 bg-tunnel-black text-marble-white w-full"
                        />
                        {/* this error shows up when the user focuses the field (meta.touched) */}
                        {meta.error && meta.touched && (
                          <span className="text-xs text-torch-red block">{meta.error}</span>
                        )}
                      </div>
                    )}
                  </Field>
                )}
              </div>
            </div>
          </form>
        )
      }}
    />
  )
}
