import create from "zustand"
import { useState, useEffect } from "react"
import { ProposalRoleType } from "@prisma/client"
import { PROPOSAL_ROLE_MAP } from "app/core/utils/constants"
import { InformationCircleIcon } from "@heroicons/react/solid"
import { StepStatus, StepType } from "./steps/Step"

export type Step = {
  description: string
  status: StepStatus
  actions: {
    [key: string]: {
      [key: string]: JSX.Element
    }
  }
  button?: JSX.Element
}

interface StepperState {
  activeRole: ProposalRoleType | null
  activeStep: StepType | null
  actions: {
    [key: string]: JSX.Element
  }
  setActiveStep: (step: StepType) => void
  setActions: (actions: any) => void // could improve types but was giving me a hard time
  setActiveRole: (role: ProposalRoleType) => void
}

export const useStepperStore = create<StepperState>((set, get) => ({
  activeRole: null,
  activeStep: null,
  actions: {},
  setActiveRole: (state) => {
    set(() => {
      return { activeRole: state }
    })
  },
  setActiveStep: (state) => {
    set(() => {
      return { activeStep: state }
    })
  },
  setActions: (state) => {
    const currentActions = get().actions
    set(() => {
      return {
        actions: {
          ...currentActions,
          [state.step]: state.actions,
        },
      }
    })
  },
}))

const StepperRenderer = ({
  activeUserRoles,
  className,
  children,
}: {
  activeUserRoles: ProposalRoleType[]
  className?: string
  children: any
}) => {
  const [showInfo, setShowInfo] = useState<boolean>(true)
  const activeRole = useStepperStore((state) => state.activeRole)
  const setActiveRole = useStepperStore((state) => state.setActiveRole)
  const actions = useStepperStore((state) => state.actions)
  const activeStep = useStepperStore((state) => state.activeStep)

  const activeActions = activeStep ? actions[activeStep] : {}

  useEffect(() => {
    if (activeUserRoles[0]) {
      setActiveRole(activeUserRoles[0])
    }
  }, [activeUserRoles])

  return (
    <nav aria-label="Progress" className={`bg-wet-concrete rounded-lg w-[300px] p-4 ${className}`}>
      <h3 className="mb-2">Proposal Progress</h3>
      {activeUserRoles.length > 0 && (
        <>
          <h4 className="mb-2 text-xs text-light-concrete uppercase">Your Roles</h4>
          <div className="flex flex-row justify-between items-center mb-3">
            <div className="flex flex-row space-x-2">
              {activeUserRoles.map((role, idx) => {
                return (
                  <span
                    key={`step-${idx}`}
                    className={`text-sm px-2 py-0.5 cursor-pointer rounded-full relative ${
                      activeRole === role ? "bg-electric-violet" : "bg-concrete"
                    }`}
                    onClick={() => setActiveRole(role)}
                  >
                    {PROPOSAL_ROLE_MAP[role]}
                    {activeActions && role in activeActions && (
                      <span className="bg-neon-carrot w-3 h-3 rounded-full block absolute top-[-3px] right-[-3px]"></span>
                    )}
                  </span>
                )
              })}
            </div>
            <InformationCircleIcon
              className={`p-1 h-6 w-6 cursor-pointer ${showInfo && "bg-concrete rounded-md"}`}
              onClick={() => setShowInfo(!showInfo)}
            />
          </div>
          {showInfo && (
            <div className="text-xs bg-concrete p-2 bg-opacity-50 rounded-md mb-2">
              Your wallet has permissions to take actions as{" "}
              {activeUserRoles.map((role) => PROPOSAL_ROLE_MAP[role]).join(" and ")}.
            </div>
          )}
        </>
      )}
      <ol role="list" className="overflow-hidden">
        {children}
      </ol>
    </nav>
  )
}

export default StepperRenderer
