export const Pill = ({ onClick, active = false, children }) => {
  const selectedStyling = active
    ? "bg-marble-white text-tunnel-black"
    : "border border-marble-white"

  return (
    <button
      onClick={onClick}
      className={`rounded-full ${selectedStyling} active:bg-marble-white active:text-concrete hover:bg-marble-white hover:text-tunnel-black py-1 px-2`}
    >
      <span className="m-4 text-sm">{children}</span>
    </button>
  )
}

export default Pill
