import { useState, useEffect } from "react"
import { ProposalRoleType } from "@prisma/client"
import { PROPOSAL_ROLE_MAP } from "app/core/utils/constants"
import { InformationCircleIcon, CheckIcon } from "@heroicons/react/solid"

export enum StepStatus {
  complete = "complete",
  current = "current",
  upcoming = "upcoming",
  loading = "loading",
}
export type Step = {
  description: string
  subtitle?: string
  status: StepStatus
  actions: {
    [key: string]: JSX.Element
  }
  button?: JSX.Element
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const Stepper = ({
  steps,
  roles,
  className,
  loading,
}: {
  steps: Step[]
  roles: ProposalRoleType[]
  className?: string
  loading: boolean
}) => {
  const [activeRole, setActiveRole] = useState<ProposalRoleType | undefined>()
  const [showInfo, setShowInfo] = useState<boolean>(true)

  useEffect(() => {
    setActiveRole(roles[0])
  }, [roles])

  if (loading) {
    return (
      <div className={`animate-pulse h-40 bg-wet-concrete w-[300px] rounded-lg ${className}`}></div>
    )
  }

  return (
    <nav aria-label="Progress" className={`bg-wet-concrete rounded-lg w-[300px] p-4 ${className}`}>
      <h3 className="mb-2">Proposal Progress</h3>
      {roles.length > 0 && (
        <>
          <h4 className="mb-2 text-xs text-light-concrete uppercase">Your Roles</h4>
          <div className="flex flex-row justify-between items-center mb-3">
            <div className="flex flex-row space-x-2">
              {roles.map((role, idx) => {
                return (
                  <span
                    key={`step-${idx}`}
                    className={`text-sm px-2 py-0.5 cursor-pointer rounded-full ${
                      activeRole === role ? "bg-electric-violet" : "bg-concrete"
                    }`}
                    onClick={() => setActiveRole(role)}
                  >
                    {PROPOSAL_ROLE_MAP[role]}
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
              {roles.map((role) => PROPOSAL_ROLE_MAP[role]).join(" and ")}.
            </div>
          )}
        </>
      )}
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => (
          <li
            key={`step-${stepIdx}`}
            className={classNames(stepIdx !== steps.length - 1 ? "pb-5" : "", "relative")}
          >
            {step.status === StepStatus.complete ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute top-2.5 left-2.5 -ml-px mt-0.5 h-full w-0.5 bg-electric-violet"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="group relative flex items-start">
                  <span className="flex h-6 items-center">
                    <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-electric-violet group-hover:bg-electric-violet">
                      <CheckIcon className="h-3 w-3 text-marble-white" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="ml-4 min-w-0">
                    <span className="text-sm text-gray-500">{step.description}</span>
                  </span>
                </span>
              </>
            ) : step.status === StepStatus.current ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute top-2.5 left-2.5 -ml-px mt-0.5 h-full w-0.5 bg-concrete"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="group relative flex items-start" aria-current="step">
                  <span className="flex h-6 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-marble-white">
                      <CheckIcon className="h-3 w-3 text-concrete" aria-hidden="true" />
                    </span>
                  </span>
                  <div className="flex flex-col space-y-2 ml-4 min-w-0">
                    <span className="text-sm text-marble-white">{step.description}</span>
                    {step.subtitle && (
                      <span className="text-xs text-marble-white">{step.subtitle}</span>
                    )}
                    {activeRole && step.actions[activeRole] && step.actions[activeRole]}
                  </div>
                </span>
              </>
            ) : (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute top-2.5 left-2.5 -ml-px mt-0.5 h-full w-0.5 bg-concrete"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="group relative flex items-start">
                  <span className="flex h-6 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-concrete bg-concrete group-hover:border-gray-400">
                      <CheckIcon className="h-3 w-3 text-wet-concrete" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="ml-4 min-w-0">
                    <span className="text-sm text-gray-500">{step.description}</span>
                  </span>
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Stepper
