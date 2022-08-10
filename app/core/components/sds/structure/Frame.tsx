import React from "react"

interface FrameProps {
  /**
   * Contents of the frame. Can be arbitrary JSX
   */
  children: React.ReactNode
}

/**
 * Primary UI component for user interaction.
 */
const Frame = ({ ...props }: FrameProps) => {
  return <div></div>
}

export default Frame
