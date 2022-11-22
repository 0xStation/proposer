// PACKAGE
import { Routes, useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useState } from "react"
import { Field } from "react-final-form"
// CORE
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
import TextareaFieldOrMarkdownPreview from "app/core/components/TextareaFieldOrMarkdownPreview"
import ReadEditMarkdownButton from "app/core/components/ReadEditMarkdownButton"
import RfpStatusFields from "../fields/RfpStatusFields"

export const RfpFormStepRfp = ({ formState }) => {
  const [bodyPreviewMode, setBodyPreviewMode] = useState<boolean>(false)

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
        <span className="text-sm text-concrete">This RFP will be listed on </span>
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
        <ReadEditMarkdownButton previewMode={bodyPreviewMode} setPreviewMode={bodyPreviewMode} />
      </div>
      <span className="text-xs text-concrete block">
        Supports <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown</TextLink>.
      </span>
      {/* TOGGLE */}
      <TextareaFieldOrMarkdownPreview
        previewMode={bodyPreviewMode}
        setPreviewMode={setBodyPreviewMode}
        markdown={formState.values.body}
        placeholder="Describe your ideas, detail the value you aim to deliver, and link any relevant documents."
        fieldName="body"
      />
      <RfpStatusFields formState={formState} isCreateForm={true} />
    </>
  )
}

export default RfpFormStepRfp
