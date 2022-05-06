const CreateTerminalProgressBar = ({ step }: { step: number }) => {
  return (
    <div className="grid grid-cols-3 gap-1 pt-8">
      <div
        className={`border-t-4 ${step >= 0 ? "border-electric-violet" : "border-light-concrete"}`}
      >
        <p className={`text-xs mt-3 ${step >= 0 ? "text-electric-violet" : "text-light-concrete"}`}>
          Tell us about your terminal
        </p>
      </div>
      <div
        className={`border-t-4 ${step >= 1 ? "border-electric-violet" : "border-light-concrete"}`}
      >
        <p className={`text-xs mt-3 ${step >= 1 ? "text-electric-violet" : "text-light-concrete"}`}>
          Add contributor properties
        </p>
      </div>
      <div
        className={`border-t-4 ${step >= 2 ? "border-electric-violet" : "border-light-concrete"}`}
      >
        <p className={`text-xs mt-3 ${step >= 2 ? "text-electric-violet" : "text-light-concrete"}`}>
          Invite members
        </p>
      </div>
    </div>
  )
}

export default CreateTerminalProgressBar
