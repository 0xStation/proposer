import { Field } from "react-final-form"
import debounce from "lodash.debounce"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import useEnsInput from "app/proposalForm/hooks/useEnsInput"
import {
  composeValidators,
  isEnsOrAddress,
  requiredField,
  mustOmitLongWords,
} from "app/utils/validators"
import { EnsAddressMetadataText } from "../EnsAddressMetadataText"
import TextLink from "app/core/components/TextLink"
import { LINKS } from "app/core/utils/constants"

export const ProposeFirstStep = () => {
  const { setAddressInputVal, ensAddressResult } = useEnsInput()

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
      <label className="font-bold block mt-6">Details*</label>
      <span className="text-xs text-concrete block">
        Supports <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown syntax</TextLink>. Need inspirations?
        Check out <TextLink url={LINKS.PROPOSAL_TEMPLATE}>proposal templates</TextLink>.
      </span>
      <Field
        name="body"
        component="textarea"
        validate={composeValidators(requiredField, mustOmitLongWords(50))}
      >
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
    </>
  )
}
