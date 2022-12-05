import { Routes } from "@blitzjs/next"
import { ProposalStatus } from "@prisma/client"
import ProposalStepper from "app/core/components/stepper/ProposalStepper"
import { ProposalViewHeaderNavigation } from "app/proposal/components/viewPage/ProposalViewHeaderNavigation"
import { useRouter } from "next/router"
import Button, { ButtonType } from "../components/sds/buttons/Button"

export const ProposalNestedLayout = ({ children, status }) => {
  const router = useRouter()
  return (
    <>
      {status === ProposalStatus.DELETED ? (
        <div className="text-marble-white flex flex-col h-full w-full justify-center text-center align-middle">
          <div>
            <h4 className="text-xl font-bold">This proposal has been deleted</h4>
            <Button
              className="mt-8 max-w-fit"
              onClick={() => router.push(Routes.Explore())}
              type={ButtonType.Secondary}
            >
              Back to Explore
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full md:min-w-1/2 md:max-w-2xl mx-auto pb-9 relative">
          <ProposalStepper />
          <ProposalViewHeaderNavigation />
          {children}
        </div>
      )}
    </>
  )
}
