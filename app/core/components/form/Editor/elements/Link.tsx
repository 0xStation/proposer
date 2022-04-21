const Link = ({ attributes, element, children }) => {
  return (
    <a {...attributes} href={element.href}>
      {children}
    </a>
  )
}

export default Link
