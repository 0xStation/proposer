import ProposalStepper from "app/proposal/components/ProposalStepper"
import { ProposalViewHeaderNavigation } from "app/proposal/components/viewPage/ProposalViewHeaderNavigation"

export const ProposalNestedLayout = ({ children }) => {
  return (
    <div className="w-full md:min-w-1/2 md:max-w-2xl mx-auto pb-9 relative">
      <ProposalStepper />
      <ProposalViewHeaderNavigation />
      {children}
    </div>
  )
}
