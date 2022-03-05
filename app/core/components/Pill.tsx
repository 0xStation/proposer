export const Pill = ({ onClick, active = false, children }) => {
  const selectedStyling = active
    ? "bg-marble-white border border-marble-white text-tunnel-black"
    : "border border-marble-white hover:bg-wet-concrete"

  return (
    <button
      onClick={onClick}
      className={`rounded-full ${selectedStyling} active:bg-marble-white active:text-concrete py-1 px-2 mr-2`}
    >
      <span className="m-4 text-sm">{children}</span>
    </button>
  )
}

export default Pill
