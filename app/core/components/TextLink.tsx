export const TextLink = ({
  url,
  children,
  className,
}: {
  className?: string
  url: string
  children?: any
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-electric-violet font-bold ${className}`}
    >
      {children}
    </a>
  )
}

export default TextLink
