import { ProposalRoleType } from "@prisma/client"
import debounce from "lodash.debounce"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import TextLink from "app/core/components/TextLink"
import { LINKS, ProposalStep, PROPOSING_AS_ROLE_MAP } from "app/core/utils/constants"
import { composeValidators, isEnsOrAddress, requiredField } from "app/utils/validators"
import { Field } from "react-final-form"
import useEnsInput from "app/proposalForm/hooks/useEnsInput"
import { EnsAddressMetadataText } from "app/proposalForm/components/EnsAddressMetadataText"
import { useState } from "react"
import { FormLayout } from "./formLayout"
import { RESERVED_KEYS } from "../types"

export const ProposeForm = ({ fields }) => {
  const [proposingAs, setProposingAs] = useState<string>()
  const { setAddressInputVal: setClientAddressInputVal, ensAddressResult: clientEnsAddressResult } =
    useEnsInput()
  const {
    setAddressInputVal: setContributorAddressInputVal,
    ensAddressResult: contributorEnsAddressResult,
  } = useEnsInput()

  const handleEnsAddressInputValOnKeyUp = (val, setValToCheckEns) => {
    const fieldVal = val.trim()
    // if value is already an address, we don't need to check for ens
    if (ethersIsAddress(fieldVal)) return

    // set state input val to update ens address
    setValToCheckEns(fieldVal)
  }

  console.log(
    "templateData",
    fields?.filter((field) => field.mapsTo === RESERVED_KEYS.ROLES)
  )
  const roles = fields?.filter((field) => field.mapsTo === RESERVED_KEYS.ROLES)

  console.log("roles", roles)

  return (
    <FormLayout proposalStep={ProposalStep.PROPOSE}>
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
        {/* BODY */}
        <label className="font-bold block mt-6">Details*</label>
        <span className="text-xs text-concrete block">
          Supports <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown syntax</TextLink>. Need
          inspirations? Check out{" "}
          <TextLink url={LINKS.PROPOSAL_TEMPLATE}>proposal templates</TextLink>.
        </span>
        <Field name="body" component="textarea" validate={requiredField}>
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
      </>
    </FormLayout>
  )
}
