export const Tag = ({ children, type }) => {
  const colorMap = {
    skill: {
      bg: "bg-neon-carrot/30",
      text: "neon-carrot",
    },
    role: {
      bg: "bg-electric-violet/20",
      text: "electric-violet",
    },
  }
  const colorScheme = colorMap[type] || colorMap["skill"]

  const tag = children ? (
    <div
      className={`rounded-full ${colorScheme.bg} h-[17px] w-max p-2.5 m-0.5 flex flex-center items-center`}
    >
      <div className={`text-${colorScheme.text} font-bold text-center text-[10px]`}>
        {typeof children === "string" && children.toUpperCase()}
      </div>
    </div>
  ) : null

  return tag
}
export default Tag
