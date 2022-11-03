import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"
import TextLink from "app/core/components/TextLink"
import { BODY_CONSTRAINT_MAP, LINKS } from "app/core/utils/constants"
import { composeValidators, isPositiveAmount, requiredField } from "app/utils/validators"
import { Field } from "react-final-form"
import Preview from "app/core/components/MarkdownPreview"
import { ProposalTemplateFieldValidationName } from "app/template/types"
import { formatPositiveInt } from "app/utils/formatters"

export const RfpFormStepPropose = ({
  formState,
  selectedBodyValidation,
  setSelectedBodyValidation,
}) => {
  const [previewMode, setPreviewMode] = useState<boolean>(false)

  return (
    <>
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
      <div className="flex flex-row justify-between">
        <div className="flex-col">
          <label className="font-bold block mt-6">What are you looking for?*</label>
          <span className="text-xs text-concrete block">
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
      {/* TOGGLE */}
      {previewMode ? (
        <div className="mt-1 bg-wet-concrete text-marble-white p-2 rounded min-h-[180px] w-full ">
          <Preview markdown={formState.values.body} />
        </div>
      ) : (
        <Field name="body" component="textarea" validate={requiredField}>
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
      {/* WORD COUNT */}
      <label className="font-bold block mt-6">Word count requirement</label>
      {/* <span className="text-xs text-concrete block"></span> */}
      <Field name="bodyValidation">
        {({ meta, input }) => (
          <>
            <div className="custom-select-wrapper">
              <select
                {...input}
                required
                className="w-full bg-wet-concrete rounded p-2 mt-1"
                value={selectedBodyValidation}
                onChange={(e) => {
                  setSelectedBodyValidation(e.target.value)
                  // custom values can be compatible with react-final-form by calling
                  // the props.input.onChange callback
                  // https://final-form.org/docs/react-final-form/api/Field
                  input.onChange(e.target.value)
                }}
              >
                <option value="">None</option>
                <option value={ProposalTemplateFieldValidationName.MIN_WORDS}>
                  {BODY_CONSTRAINT_MAP[ProposalTemplateFieldValidationName.MIN_WORDS]?.copy}
                </option>
              </select>
            </div>
          </>
        )}
      </Field>
      {selectedBodyValidation === ProposalTemplateFieldValidationName.MIN_WORDS && (
        <>
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
    </>
  )
}

export default RfpFormStepPropose
