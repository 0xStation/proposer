// PACKAGE
import { Routes, useParam } from "@blitzjs/next"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"
import { useRouter } from "next/router"
import { useState } from "react"
import { Field } from "react-final-form"
// CORE
import Preview from "app/core/components/MarkdownPreview"
import TextLink from "app/core/components/TextLink"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import { BODY_CONSTRAINT_MAP, LINKS } from "app/core/utils/constants"
import { formatPositiveInt } from "app/utils/formatters"
import { composeValidators, isPositiveAmount, requiredField } from "app/utils/validators"
// MODULE
import { ProposalTemplateFieldValidationName } from "app/template/types"
import { useQuery } from "@blitzjs/rpc"
import getAccountByAddress from "app/account/queries/getAccountByAddress"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

export const RfpFormStepRfp = ({ formState }) => {
  const [bodyPreviewMode, setBodyPreviewMode] = useState<boolean>(false)
  const [bodyPrefillPreviewMode, setBodyPrefillPreviewMode] = useState<boolean>(false)
  const accountAddress = useParam("accountAddress", "string") as string
  const { text: displayAddress } = useDisplayAddress(accountAddress)
  const router = useRouter()

  const [account] = useQuery(
    getAccountByAddress,
    { address: toChecksumAddress(accountAddress) },
    {
      enabled: !!accountAddress,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
      onSuccess: (data) => {
        if (!data) {
          router.push(Routes.Page404())
        }
      },
      onError: (data) => {
        if (!data) {
          router.push(Routes.Page404())
        }
      },
    }
  )

  return (
    <>
      <div className="mt-2 flex flex-row space-x-1 items-center">
        <span className="text-sm text-marble-white">This RFP will be listed on </span>
        <button
          className="text-sm text-electric-violet font-bold"
          onClick={() => {
            router.push(Routes.WorkspaceHome({ accountAddress }))
          }}
        >
          {account?.data?.name || displayAddress}
        </button>
      </div>
      {/* TITLE */}
      <label className="font-bold block mt-6">Title*</label>
      <Field name="title" validate={requiredField}>
        {({ meta, input }) => (
          <>
            <input
              {...input}
              type="text"
              required
              placeholder="Add a title for your idea"
              className="bg-wet-concrete rounded mt-1 w-full p-2"
            />

            {meta.touched && meta.error && (
              <span className="text-torch-red text-xs">{meta.error}</span>
            )}
          </>
        )}
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
      <span className="text-xs text-concrete block">
        Supports <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown</TextLink>. See{" "}
        <TextLink url={LINKS.MARKDOWN_GUIDE}>examples of RFPs</TextLink>.
      </span>
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
      <span className="text-xs text-concrete block">
        Proposer will automatically see the template&apos;s content in proposal details. Supports{" "}
        <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown</TextLink>. See examples of{" "}
        <TextLink url={LINKS.MARKDOWN_GUIDE}>RFP templates</TextLink>.
      </span>
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
    </>
  )
}

export default RfpFormStepRfp
