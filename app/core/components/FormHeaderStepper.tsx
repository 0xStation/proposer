// step styling.
// TODO: need to figure out how to workaround tailwind dynamic styling
const stepperSizeToStepsStyling = {
  2: {
    0: "left-[20px]",
    1: "left-[300px]",
  },
  3: {
    0: "left-[20px]",
    1: "left-[220px]",
    2: "left-[440px]",
  },
}

export const FormHeaderStepper = ({
  activeStep,
  steps,
  className,
}: {
  activeStep: string
  steps: string[]
  className?: string
}) => {
  const stepperStyling = stepperSizeToStepsStyling[steps.length]

  return (
    <div className={`w-full h-2 bg-neon-carrot relative ${className}`}>
      {steps.map((step, idx) => {
        const isActive = steps[idx] === activeStep
        return (
          <div className={`absolute ${stepperStyling[idx]} top-[-4px]`} key={step}>
            <span className="h-4 w-4 rounded-full border-2 border-neon-carrot bg-tunnel-black block relative">
              {idx <= steps.indexOf(activeStep) && (
                <span
                  className={`h-2 bg-neon-carrot block absolute ${
                    isActive
                      ? "w-1 rounded-l-full top-[1.75px] left-[2px]"
                      : "w-2 rounded-full top-[1.75px] left-[2px]"
                  }`}
                ></span>
              )}
            </span>
            <p className={`font-bold mt-2 ${isActive ? "text-marble-white" : "text-concrete"}`}>
              {steps[idx]}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default FormHeaderStepper
