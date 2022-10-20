import React, { useState, useEffect } from "react"
import { useQuery, useSession, useRouter, Routes, useMutation } from "blitz"
import { Form } from "react-final-form"
import {
  FORM_PAGE,
  FUNDING_PROPOSAL,
  ProposalFormHeaderCopy,
  ProposalStep,
} from "app/core/utils/constants"
import Stepper from "app/proposalForm/components/Stepper"
import { ProposalCreationLoadingScreen } from "app/proposalForm/components/ProposalCreationLoadingScreen"
import { Proposal } from "app/proposal/types"
import { ProposeForm } from "./proposeForm"
import { FormLayout } from "./formLayout"
import { TemplateFieldType } from "../types"

// TODO: move to constants file
const formConfig = {
  ["FUNDING"]: {
    steps: [ProposalStep.PROPOSE, ProposalStep.REWARDS, ProposalStep.CONFIRM],
  },
  ["NON_FUNDING"]: {
    steps: [ProposalStep.PROPOSE, ProposalStep.CONFIRM],
  },
}

export const BaseForm = ({ template, formType }) => {
  const [proposalStep, setProposalStep] = useState<ProposalStep>(formConfig[formType].steps[0])
  const [createdProposal, setCreatedProposal] = useState<Proposal | null>(null)
  const [proposalShouldSendLater, setProposalShouldSendLater] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // const initialValues = generateInitialValues(template?.data?.fields)
  return (
    <div className="max-w-[580px] h-full mx-auto">
      <Stepper
        activeStep={ProposalFormHeaderCopy[proposalStep]}
        steps={formConfig[formType].steps.map((step) => ProposalFormHeaderCopy[step])}
        className="mt-10"
      />
      <Form
        // TODO: anywhere where the fields is pre-select we need to
        initialValues={{}}
        onSubmit={async (values: any, form) => {}}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()

          return (
            <form onSubmit={handleSubmit} className="mt-20">
              {isLoading ? (
                <FormLayout>
                  <ProposalCreationLoadingScreen
                    createdProposal={createdProposal}
                    proposalShouldSendLater={proposalShouldSendLater}
                  />
                </FormLayout>
              ) : (
                <>
                  {proposalStep === ProposalStep.PROPOSE && (
                    <ProposeForm
                      fields={template?.data?.fields?.filter((field) =>
                        FORM_PAGE[ProposalStep.PROPOSE].some((val) => val === field.key)
                      )}
                    />
                  )}
                  {proposalStep === ProposalStep.REWARDS && <div></div>}
                  {proposalStep === ProposalStep.CONFIRM && <div></div>}
                </>
              )}
            </form>
          )
        }}
      />
    </div>
  )
}

export default BaseForm
