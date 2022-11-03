import { useState } from "react"
import { Field } from "react-final-form"
import { useRouter } from "next/router"
import { useQuery } from "@blitzjs/rpc"
import { useParam, Routes } from "@blitzjs/next"
import { composeValidators, mustBeAboveNumWords, requiredField } from "app/utils/validators"
import TextLink from "app/core/components/TextLink"
import { LINKS } from "app/core/utils/constants"
import { getClientAddress, getContributorAddress, getMinNumWords } from "app/template/utils"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import getTemplateById from "app/template/queries/getTemplateById"
import getRfpById from "app/rfp/queries/getRfpById"
import Preview from "app/core/components/MarkdownPreview"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"
import { useSession } from "@blitzjs/auth"

export const TemplateFormStepPropose = ({ formState }) => {
  const session = useSession({ suspense: false })
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const templateId = useParam("templateId") as string
  const { rfpId } = useRouter().query
  const router = useRouter()
  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId as string,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
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
  const [template] = useQuery(
    getTemplateById,
    {
      id: templateId as string,
    },
    {
      enabled: !!templateId,
      suspense: false,
      refetchOnWindowFocus: false,
    }
  )

  const templateClientAddress = getClientAddress(template?.data?.fields)
  const templateContributorAddress = getContributorAddress(template?.data?.fields)
  const connectedAddress = session?.siwe?.address as string

  const clientAddress = templateClientAddress ? templateClientAddress : connectedAddress
  const contributorAddress = templateContributorAddress
    ? templateContributorAddress
    : connectedAddress

  const { text: clientDisplayAddress } = useDisplayAddress(clientAddress)
  const { text: contributorDisplayAddress } = useDisplayAddress(contributorAddress)

  return (
    <>
      {templateClientAddress && (
        <>
          {/* CLIENT */}
          <div className="mt-4 flex flex-row w-full items-center justify-between">
            <span className="font-bold">To</span>
            <span className="items-end">{"@" + clientDisplayAddress}</span>
          </div>
        </>
      )}
      {templateContributorAddress && (
        <>
          {/* CONTRIBUTOR */}
          <div className="mt-4 flex flex-row w-full items-center justify-between">
            <span className="font-bold">To</span>
            <span className="items-end">{"@" + contributorDisplayAddress}</span>
          </div>
        </>
      )}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Title</span>
        <span className="items-end">{`"${rfp?.data.content.title || ""}" submission`}</span>
      </div>
      {/* BODY */}
      <div className="flex flex-row justify-between">
        <div className="flex-col">
          <label className="font-bold block mt-6">Details*</label>
          <span className="text-xs text-concrete block">
            {getMinNumWords(template?.data.fields) > 0
              ? `${getMinNumWords(template?.data.fields)} words minimum.`
              : ""}{" "}
            Supports <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown syntax</TextLink>.
          </span>
        </div>
        <button
          type="button"
          className="pt-1"
          onClick={(e) => {
            e.preventDefault()
            setPreviewMode(!previewMode)
          }}
        >
          {previewMode ? (
            <>
              <p className="inline text-sm text-concrete">Edit</p>{" "}
              <EyeOffIcon className="inline h-5 w-5 fill-concrete" />
            </>
          ) : (
            <>
              <p className="inline text-sm text-concrete">Read</p>{" "}
              <EyeIcon className="inline h-5 w-5 fill-concrete" />
            </>
          )}
        </button>
      </div>
      {previewMode ? (
        <div className="mt-1 bg-wet-concrete text-marble-white p-2 rounded min-h-[236px] w-full ">
          <Preview markdown={formState.values.body} />
        </div>
      ) : (
        <Field
          name="body"
          component="textarea"
          validate={composeValidators(
            requiredField,
            mustBeAboveNumWords(getMinNumWords(template?.data.fields))
          )}
        >
          {({ input, meta }) => (
            <div>
              <textarea
                {...input}
                rows={10}
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
    </>
  )
}

export default TemplateFormStepPropose
