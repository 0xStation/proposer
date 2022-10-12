import React, { useState } from "react"
import { Field, Form } from "react-final-form"
import { AddressType } from "@prisma/client"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import debounce from "lodash.debounce"
import Button from "app/core/components/sds/buttons/Button"
import TextLink from "app/core/components/TextLink"
import { LINKS } from "app/core/utils/constants"
import { composeValidators, isEnsOrAddress, requiredField } from "app/utils/validators"
import Stepper from "../Stepper"
import useEnsInput from "app/proposalForm/hooks/useEnsInput"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"
import AddressLink from "app/core/components/AddressLink"
import BackArrow from "app/core/icons/BackArrow"

const EnsAddressMetadataText = ({ address }) => {
  return (
    <span className="text-xs text-concrete mt-1">
      ENS Address is{" "}
      <AddressLink className="inline" address={address}>
        {address}
      </AddressLink>
    </span>
  )
}

const GnosisWalletTypeMetadataText = ({ addressType }) => {
  return (
    <>
      <span className=" text-xs text-marble-white ml-2 mt-2 block">
        The address inserted is a{" "}
        {addressType === AddressType.WALLET ? (
          <>
            <span className="font-bold">personal wallet</span>. If it is a smart contract, please
            insert a new address or change your network.
          </>
        ) : (
          <>
            <span className="font-bold">Gnosis Safe</span>.
          </>
        )}
      </span>
    </>
  )
}

const ConfirmForm = () => {
  console.log("hey!")
  return (
    <div className="flex flex-col justify-center items-center mt-10">
      <p>
        Upon confirmation, the proposal will be sent to all parties included in the proposal. You
        also have the option to send the proposal later.
      </p>
    </div>
  )
}

const ProposeFirstStep = () => {
  const [inputtedAddressType, setInputtedAddressType] = useState<AddressType>()
  const { setAddressInputVal, ensAddressResult } = useEnsInput()
  let abortController = new AbortController()

  const handleAddressInputValOnBlur = async (val, setAddressType, ensAddress) => {
    abortController.abort() // Cancel the previous request
    abortController = new AbortController()
    const fieldVal = val.trim()

    const address = ensAddress || fieldVal
    if (ethersIsAddress(address)) {
      // TODO: check if selected network id doesn't equal to 0
      try {
        const gnosisSafeDetails = await getGnosisSafeDetails(
          1, // selectedNetworkId
          address,
          abortController.signal
        )

        // if the gnosisSafeDetails doesn't exist, assume that it's a personal wallet
        const addressType = !gnosisSafeDetails ? AddressType.WALLET : AddressType.SAFE

        setAddressType(addressType)
        return
      } catch (err) {
        console.error(err)
        // setContributorAddress to undefined
      }
    }
    setAddressType(undefined)
  }

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
                onBlur={(e) => {
                  handleAddressInputValOnBlur(
                    e.target.value,
                    setInputtedAddressType,
                    ensAddressResult
                  )
                  input.onBlur(e)
                }}
              />

              {(meta.touched && meta.error && (
                <span className="text-torch-red text-xs">{meta.error}</span>
              )) ||
                (ensAddressResult && <EnsAddressMetadataText address={ensAddressResult} />)}
              {!meta.error && input.value && !!inputtedAddressType && (
                <GnosisWalletTypeMetadataText addressType={inputtedAddressType} />
              )}
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
    </>
  )
}

enum FundingProposalStep {
  PROPOSE = "PROPOSE",
  CONFIRM = "CONFIRM",
}

const HeaderCopy = {
  [FundingProposalStep.PROPOSE]: "Propose",
  [FundingProposalStep.CONFIRM]: "Confirm",
}

export const ProposalNonFundingForm = ({
  prefillClients,
  prefillContributors,
}: {
  prefillClients: string[]
  prefillContributors: string[]
}) => {
  const [proposalStep, setProposalStep] = useState<FundingProposalStep>(FundingProposalStep.PROPOSE)

  return (
    <div className="max-w-[580px] h-full mx-auto">
      <Stepper
        activeStep={HeaderCopy[proposalStep]}
        steps={["Propose", "Confirm"]}
        className="mt-10"
      />{" "}
      <Form
        initialValues={{
          client: prefillClients?.[0] || "",
          contributor: prefillContributors?.[0] || "",
        }}
        onSubmit={async (values: any, form) => {}}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()

          const unFilledProposalFields = // has not selected who user is proposing as
            !formState.values.toAddress || !formState.values.title || !formState.values.body

          return (
            <form onSubmit={handleSubmit} className="mt-20">
              <div className="rounded-2xl border border-concrete p-6 h-[560px] overflow-y-scroll">
                <h2 className="text-marble-white text-xl font-bold">{HeaderCopy[proposalStep]}</h2>
                {proposalStep === FundingProposalStep.PROPOSE && <ProposeFirstStep />}
                {proposalStep === FundingProposalStep.CONFIRM && <ConfirmForm />}
              </div>
              {proposalStep === FundingProposalStep.PROPOSE && (
                <Button
                  isDisabled={unFilledProposalFields}
                  className="my-6 float-right"
                  onClick={() => {
                    // TODO: add validation before clicking next
                    setProposalStep(FundingProposalStep.CONFIRM)
                  }}
                >
                  Next
                </Button>
              )}
              {proposalStep === FundingProposalStep.CONFIRM && (
                <div className="flex justify-between mt-6">
                  <span
                    onClick={() => setProposalStep(FundingProposalStep.PROPOSE)}
                    className="cursor-pointer border rounded border-marble-white p-2 self-start"
                  >
                    <BackArrow className="fill-marble-white" />
                  </span>
                </div>
              )}
            </form>
          )
        }}
      />
    </div>
  )
}

export default ProposalNonFundingForm
