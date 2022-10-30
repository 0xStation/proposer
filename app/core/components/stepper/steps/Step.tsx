import { CheckIcon } from "@heroicons/react/solid"
import { ProposalRoleType } from "@prisma/client"
import { useStepperStore } from "../StepperRenderer"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export enum StepStatus {
  complete = "complete",
  current = "current",
  upcoming = "upcoming",
  loading = "loading",
}

type ActionMapType = {
  [ProposalRoleType.AUTHOR]?: JSX.Element
  [ProposalRoleType.CLIENT]?: JSX.Element
  [ProposalRoleType.CONTRIBUTOR]?: JSX.Element
}

const Step = ({
  status,
  description,
  subtitle,
  actions,
  action,
  options,
}: {
  status: StepStatus
  action?: JSX.Element
  actions?: ActionMapType
  description: string
  subtitle?: string
  options?: { first?: boolean; last?: boolean }
}) => {
  const activeRole = useStepperStore((state) => state.activeRole)

  return (
    <li className={classNames(!options?.last ? "pb-5" : "", "relative")}>
      {status === StepStatus.complete ? (
        <>
          {!options?.last ? (
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
              <span className="text-sm text-concrete">{description}</span>
            </span>
          </span>
        </>
      ) : status === StepStatus.current ? (
        <>
          {!options?.last ? (
            <div
              className="absolute top-2.5 left-2.5 -ml-px mt-0.5 h-full w-0.5 bg-concrete"
              aria-hidden="true"
            />
          ) : null}
          <span className="group relative flex items-start" aria-current="step">
            <span className="flex h-6 items-center" aria-hidden="true">
              <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-marble-white bg-wet-concrete"></span>
            </span>
            <div className="flex flex-col space-y-2 ml-4 min-w-0">
              <span className="text-sm text-marble-white">{description}</span>
              <span className="text-xs">{subtitle}</span>
              {action}
              {/* {activeRole && actions && actions[activeRole]} */}
            </div>
          </span>
        </>
      ) : (
        <>
          {!options?.last ? (
            <div
              className="absolute top-2.5 left-2.5 -ml-px mt-0.5 h-full w-0.5 bg-concrete"
              aria-hidden="true"
            />
          ) : null}
          <span className="group relative flex items-start">
            <span className="flex h-6 items-center" aria-hidden="true">
              <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-concrete bg-wet-concrete group-hover:border-gray-400"></span>
            </span>
            <span className="ml-4 min-w-0">
              <span className="text-sm text-light-concrete">{description}</span>
            </span>
          </span>
        </>
      )}
    </li>
  )
}

export default Step
