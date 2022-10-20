import { ProposalFormHeaderCopy } from "app/core/utils/constants"

export const FormLayout = ({
  children,
  proposalStep,
}: {
  children: any
  proposalStep?: string
}) => {
  return (
    <div className="rounded-2xl border border-concrete p-6 h-[560px] overflow-y-scroll">
      {proposalStep && (
        <h2 className="text-marble-white text-xl font-bold">
          {ProposalFormHeaderCopy[proposalStep]}
        </h2>
      )}
      {children}
    </div>
  )
}

export default FormLayout
