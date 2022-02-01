type CardProps = {
  onClick?: (user) => void
  children?: any
}

export const Card = ({ onClick, children }: CardProps) => {
  const hoverStyling = onClick ? "hover:border-neon-blue" : ""
  const tabIndex = onClick ? 0 : -1
  return (
    <div
      className={`flex flex-col p-1 pb-2.5 text-marble-white border-[1px] border-concrete cursor-pointer width-[250px] ${hoverStyling} h-full`}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  )
}

export default Card
