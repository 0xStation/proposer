import { useState } from "react"
import { Field } from "react-final-form"
import { EyeOffIcon } from "@heroicons/react/outline"
import { EyeIcon } from "@heroicons/react/solid"
import debounce from "lodash.debounce"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import useEnsInput from "app/proposalForm/hooks/useEnsInput"
import { composeValidators, isEnsOrAddress, requiredField } from "app/utils/validators"
import { EnsAddressMetadataText } from "../EnsAddressMetadataText"
import TextLink from "app/core/components/TextLink"
import { LINKS } from "app/core/utils/constants"
import Preview from "app/core/components/MarkdownPreview"

export const IdeaFormStepPropose = ({ formState }) => {
  const { setAddressInputVal, ensAddressResult } = useEnsInput()
  const [previewMode, setPreviewMode] = useState<boolean>(false)

  const handleEnsAddressInputValOnKeyUp = (val, setValToCheckEns) => {
    const fieldVal = val.trim()
    // if value is already an address, we don't need to check for ens
    if (ethersIsAddress(fieldVal)) return

    // set state input val to update ens address
    setValToCheckEns(fieldVal)
  }
  return (
    <>
      {/* CLIENT */}
      <label className="font-bold block mt-6">To*</label>
      <span className="text-xs text-concrete block">
        Find the <TextLink url={LINKS.STATION_WORKSPACES}>addresses</TextLink> of featured
        communities and individuals.
      </span>
      <Field name="toAddress" validate={composeValidators(requiredField, isEnsOrAddress)}>
        {({ meta, input }) => {
          return (
            <>
              <input
                {...input}
                type="text"
                required
                placeholder="Enter ENS name or wallet address"
                className="bg-wet-concrete rounded mt-1 w-full p-2"
                onKeyUp={debounce(
                  (e) => handleEnsAddressInputValOnKeyUp(e.target.value, setAddressInputVal),
                  200
                )}
              />

              {(meta.touched && meta.error && (
                <span className="text-torch-red text-xs">{meta.error}</span>
              )) ||
                (ensAddressResult && <EnsAddressMetadataText address={ensAddressResult} />)}
            </>
          )
        }}
      </Field>
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
      {/* BODY */}
      <div className="flex flex-row justify-between">
        <div className="flex-col">
          <label className="font-bold block mt-6">Details*</label>
          <span className="text-xs text-concrete block">
            Supports <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown syntax</TextLink>. Need
            inspirations? Check out{" "}
            <TextLink url={LINKS.PROPOSAL_TEMPLATE}>proposal templates</TextLink>.
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
        <Field name="body" component="textarea" validate={composeValidators(requiredField)}>
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
    </>
  )
}

export default IdeaFormStepPropose
