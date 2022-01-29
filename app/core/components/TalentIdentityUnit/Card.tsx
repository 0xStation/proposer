type CardProps = {
  onClick?: (user) => void
  children?: any
}

export const Card = ({ onClick, children }) => {
  return (
    <div
      className={`flex flex-col p-1 pb-2.5 text-marble-white border-[1px] border-concrete cursor-pointer width-[250px] h-full`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card
