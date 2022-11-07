import { useState } from "react"
import { Field } from "react-final-form"
import debounce from "lodash.debounce"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import useEnsInput from "app/proposalForm/hooks/useEnsInput"
import { composeValidators, isEnsOrAddress, requiredField } from "app/utils/validators"
import { EnsAddressMetadataText } from "../EnsAddressMetadataText"
import TextLink from "app/core/components/TextLink"
import { LINKS, PROPOSING_AS_ROLE_MAP } from "app/core/utils/constants"
import { ProposalRoleType } from "@prisma/client"
import { isEns } from "app/core/utils/isEns"
import Preview from "app/core/components/MarkdownPreview"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"

export const PartnershipFormStepPropose = ({ proposingAs, setProposingAs, formState }) => {
  const { setAddressInputVal: setClientAddressInputVal, ensAddressResult: clientEnsAddressResult } =
    useEnsInput()
  const {
    setAddressInputVal: setContributorAddressInputVal,
    ensAddressResult: contributorEnsAddressResult,
  } = useEnsInput()
  const [previewMode, setPreviewMode] = useState<boolean>(false)

  const handleEnsAddressInputValOnKeyUp = (val, setValToCheckEns) => {
    const fieldVal = val.trim()
    // if value is already an address, skip ENS check
    if (ethersIsAddress(fieldVal)) return

    // if value does not adhere to ENS string format, skip ENS check
    if (!isEns(val)) return

    // set state input val to update ens address
    setValToCheckEns(fieldVal)
  }

  return (
    <>
      {/* PROPOSING AS */}
      <label className="font-bold block mt-6">I&apos;m proposing as...*</label>
      <Field name="proposingAs" validate={requiredField}>
        {({ input, meta }) => {
          return (
            <>
              <div className="custom-select-wrapper">
                <select
                  {...input}
                  className="w-full bg-wet-concrete rounded p-2 mt-1"
                  onChange={(e) => {
                    setProposingAs(e.target.value)

                    // custom values can be compatible with react-final-form by calling
                    // the props.input.onChange callback
                    // https://final-form.org/docs/react-final-form/api/Field
                    input.onChange(e.target.value)
                  }}
                >
                  <option value="">Select option</option>
                  {[
                    ProposalRoleType.CONTRIBUTOR,
                    ProposalRoleType.CLIENT,
                    ProposalRoleType.AUTHOR,
                  ].map((roleType, idx) => {
                    return (
                      <option key={roleType} value={roleType}>
                        {PROPOSING_AS_ROLE_MAP[roleType]?.copy || ""}
                      </option>
                    )
                  })}
                </select>
              </div>
              {meta.touched && meta.error && (
                <span className="text-torch-red text-xs">{meta.error}</span>
              )}
            </>
          )
        }}
      </Field>
      {/* only show rest of step if proposingAs is selected  */}
      {!!proposingAs && (
        <>
          {/* if proposing as contributor or author, show client field */}
          {proposingAs !== ProposalRoleType.CLIENT && (
            <>
              {/* CLIENT */}
              <label className="font-bold block mt-6">
                Who will be reviewing and approving the work?*
              </label>
              <span className="text-xs text-concrete block">
                Find the <TextLink url={LINKS.STATION_WORKSPACES}>addresses</TextLink> of featured
                communities and individuals.
              </span>
              <Field name="client" validate={composeValidators(requiredField, isEnsOrAddress)}>
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
                          (e) =>
                            handleEnsAddressInputValOnKeyUp(
                              e.target.value,
                              setClientAddressInputVal
                            ),
                          200
                        )}
                      />

                      {meta.touched && meta.error && (
                        <span className="text-torch-red text-xs">{meta.error}</span>
                      )}
                      {clientEnsAddressResult && (
                        <EnsAddressMetadataText address={clientEnsAddressResult} />
                      )}
                    </>
                  )
                }}
              </Field>
            </>
          )}
          {/* if proposing as client or author, show contributor field */}
          {proposingAs !== ProposalRoleType.CONTRIBUTOR && (
            <>
              {/* CONTRIBUTOR */}
              <label className="font-bold block mt-6">Who will be delivering the work?*</label>
              <span className="text-xs text-concrete block">
                Find the <TextLink url={LINKS.STATION_WORKSPACES}>addresses</TextLink> of featured
                communities and individuals.
              </span>
              <Field name="contributor" validate={composeValidators(requiredField, isEnsOrAddress)}>
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
                          (e) =>
                            handleEnsAddressInputValOnKeyUp(
                              e.target.value,
                              setContributorAddressInputVal
                            ),
                          200
                        )}
                      />

                      {meta.touched && meta.error && (
                        <span className="text-torch-red text-xs">{meta.error}</span>
                      )}
                      {contributorEnsAddressResult && (
                        <EnsAddressMetadataText address={contributorEnsAddressResult} />
                      )}
                    </>
                  )
                }}
              </Field>
            </>
          )}
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
                  <p className="inline text-sm text-concrete">Preview</p>{" "}
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
                    className="mt-1 bg-wet-concrete text-marble-white p-2 rounded min-h-[236px] w-full"
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
      )}
    </>
  )
}

export default PartnershipFormStepPropose
