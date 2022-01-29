export const Pill = ({ onClick, active = false, children }) => {
  const selectedStyling = active ? "bg-marble-white text-concrete" : "border border-marble-white"

  return (
    <button
      onClick={onClick}
      className={`rounded-xl h-[29px] ${selectedStyling} active:bg-marble-white active:text-concrete`}
    >
      <span className="m-4">{children}</span>
    </button>
  )
}

export default Pill
