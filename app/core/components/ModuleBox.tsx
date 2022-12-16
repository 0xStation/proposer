export const ModuleBox = ({ isLoading, children, className = "" }) => {
  return isLoading ? (
    // Skeleton loading screen
    <div
      tabIndex={0}
      className={`${className} h-[300px] w-full flex flex-row rounded-2xl bg-wet-concrete shadow border-solid motion-safe:animate-pulse`}
    />
  ) : (
    <>
      <div className={`border border-concrete rounded-2xl p-6 ${className}`}>{children}</div>
    </>
  )
}
