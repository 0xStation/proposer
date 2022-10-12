import { CheckIcon } from "@heroicons/react/solid"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"

type Action = {
  title: string
  behavior: () => void
}

type Step = {
  description: string
  status: string
  action?: Action
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const Stepper = ({ steps, className }: { steps: Step[]; className?: string }) => {
  return (
    <nav aria-label="Progress" className={`bg-wet-concrete rounded-lg w-[300px] p-4 ${className}`}>
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => (
          <li
            key={`step-${stepIdx}`}
            className={classNames(stepIdx !== steps.length - 1 ? "pb-5" : "", "relative")}
          >
            {step.status === "complete" ? (
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
                    <span className="text-sm text-concrete">{step.description}</span>
                  </span>
                </span>
              </>
            ) : step.status === "current" ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute top-2.5 left-2.5 -ml-px mt-0.5 h-full w-0.5 bg-concrete"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="group relative flex items-start" aria-current="step">
                  <span className="flex h-6 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-electric-violet bg-marble-white">
                      <span className="h-2 w-2 rounded-full bg-electric-violet" />
                    </span>
                  </span>
                  <div className="flex flex-col space-y-2 ml-4 min-w-0">
                    <span className="text-sm text-marble-white">{step.description}</span>
                    {step.action && (
                      <Button type={ButtonType.Secondary}>{step.action?.title}</Button>
                    )}
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
                    <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-concrete bg-wet-concrete group-hover:border-gray-400">
                      <span className="h-2 w-2 rounded-full bg-transparent group-hover:bg-concrete" />
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
