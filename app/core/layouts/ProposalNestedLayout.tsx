import ProposalStepper from "app/core/components/stepper/ProposalStepper"
import { ProposalViewHeaderNavigation } from "app/proposal/components/viewPage/ProposalViewHeaderNavigation"

export const ProposalNestedLayout = ({ children }) => {
  return (
    <div className="w-full h-full md:min-w-1/2 md:max-w-2xl mx-auto pb-9 relative">
      {/* <ProposalStepper /> */}
      <ProposalViewHeaderNavigation />
      {children}
    </div>
  )
}
