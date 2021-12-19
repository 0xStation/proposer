const ChevronIcon = ({ isUp, className }: { isUp: boolean; className: string }) => {
  return (
    <svg
      width="12"
      height="7"
      viewBox="0 0 12 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${isUp && "rotate-180"}`}
    >
      <path d="M6 7L0.803848 0.25H11.1962L6 7Z" fill="#F2EFEF" />
    </svg>
  )
}

export default ChevronIcon
