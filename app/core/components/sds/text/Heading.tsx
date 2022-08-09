import React from "react"

interface HeadingProps {
  /**
   * Contents of the heading. Can be arbitrary JSX
   */
  children: React.ReactNode
}

/**
 * Used as the title of each major section of a page.
 */
const Heading = ({ ...props }: HeadingProps) => {
  return <h1 className="text-2xl font-bold">{props.children}</h1>
}

export default Heading
