import React, { useState } from "react"
import { Field, Form } from "react-final-form"
import { useRouter } from "next/router"
import { Routes, useParam } from "@blitzjs/next"
import { useQuery, useMutation, invalidateQuery } from "@blitzjs/rpc"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"
import { requiredField } from "app/utils/validators"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import Preview from "app/core/components/MarkdownPreview"
import getProposalById from "../queries/getProposalById"
import useStore from "app/core/hooks/useStore"
import { useSignProposal } from "app/core/hooks/useSignProposal"
import editProposal from "../mutations/editProposal"
import AnnotateProposalVersionModal from "app/proposalVersion/components/AnnotateProposalVersionModal"
import getProposalVersionsByProposalId from "app/proposalVersion/queries/getProposalVersionsByProposalId"
import getRolesByProposalId from "app/proposalRole/queries/getRolesByProposalId"

export const EditProposalForm = () => {
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const setToastState = useStore((state) => state.setToastState)
  const [isAnnotateModalOpen, setIsAnnotateModalOpen] = useState<boolean>(false)
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
  const [editProposalMutation] = useMutation(editProposal, {
    onSuccess: (data) => {
      setIsSubmitting(false)
      setToastState({
        isToastShowing: true,
        type: "success",
        message:
          "Successfully updated your proposal. Redirecting you back to the proposal details page.",
      })
      router.push(Routes.ViewProposal({ proposalId: proposalId as string }))
    },
  })
  const { signProposal } = useSignProposal()

  const handleFormSubmit = async (values: any, annotationValue: any) => {
    setIsSubmitting(true)
    const proposalCopy = JSON.parse(JSON.stringify(proposal))
    const newVersion = proposalCopy?.version + 1
    let signatureData
    try {
      signatureData = await signProposal({
        proposal: {
          ...proposalCopy,
          version: newVersion,
          data: {
            ...proposalCopy.data,
            content: {
              title: values.title,
              body: values.body,
            },
          },
        },
      })
    } catch (err) {
      setIsAnnotateModalOpen(false)
      setIsSubmitting(false)
      console.error("Failed to sign proposal", err)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: `Unable to edit proposal. ${err}`,
      })
      return
    }
    const { message, signature, proposalHash } = signatureData
    const { title, body } = values
    const proposalMetadata = JSON.parse(JSON.stringify(proposal?.data || {}))
    if (message && signature && proposalHash) {
      try {
        await editProposalMutation({
          proposalId: proposal?.id as string,
          updatedVersion: newVersion,
          contentTitle: title,
          contentBody: body,
          proposalHash: proposalHash,
          signature: signature,
          signatureMessage: message,
          totalPayments: proposalMetadata?.totalPayments,
          paymentTerms: proposalMetadata?.paymentTerms,
          advancePaymentPercentage: proposalMetadata?.advancePaymentPercentage,
          proposalVersionAnnotation: annotationValue,
        })
        invalidateQuery(getProposalById)
        invalidateQuery(getProposalVersionsByProposalId)
        invalidateQuery(getRolesByProposalId)
      } catch (err) {
        setIsAnnotateModalOpen(false)
        setIsSubmitting(false)
        console.error("Error editing a proposal", err)
        setToastState({
          isToastShowing: true,
          type: "error",
          message: `Unable to edit a proposal.`,
        })
        return
      }
    } else {
      setIsAnnotateModalOpen(false)
      setIsSubmitting(false)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: `Unable to edit a proposal.`,
      })
    }
  }
  return (
    <>
      <Form
        initialValues={{
          title: proposal?.data?.content?.title,
          body: proposal?.data?.content?.body,
        }}
        onSubmit={async (values: any, form) => {
          setIsAnnotateModalOpen(true)
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()

          return (
            <form onSubmit={handleSubmit} className="pt-8 px-8 w-full">
              <AnnotateProposalVersionModal
                isOpen={isAnnotateModalOpen}
                setIsOpen={setIsAnnotateModalOpen}
                isSubmitting={isSubmitting}
                handleSubmit={async (annotationValues) =>
                  await handleFormSubmit(formState.values, annotationValues)
                }
              />
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
                <Button
                  isSubmitType={true}
                  isDisabled={!formState.dirty || isSubmitting}
                  isLoading={isSubmitting}
                >
                  Re-sign & save changes
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
                          <textarea
                            rows={20}
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
    </>
  )
}
