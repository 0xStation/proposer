export const TextLink = ({
  className = "",
  url,
  children,
}: {
  className?: string
  url: string
  children?: any
}) => {
  return (
    <a className={className} href={url} target="_blank" rel="noopener noreferrer">
      <span className="text-electric-violet">{children}</span>
    </a>
  )
}

export default TextLink
