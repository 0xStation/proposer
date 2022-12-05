import React, { useRef, useEffect } from "react"

interface TextAreaProps {
  value: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
}

const ExpandingTextArea = ({ value, onChange, placeholder, className }: TextAreaProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const MIN_TEXTAREA_HEIGHT = 40

  useEffect(() => {
    // Update the height of the textarea when the value changes
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "inherit"
      textAreaRef.current.style.height = `${Math.max(
        textAreaRef.current?.scrollHeight || MIN_TEXTAREA_HEIGHT,
        MIN_TEXTAREA_HEIGHT
      )}px`
    }
  }, [value])

  return (
    <textarea
      ref={textAreaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        minHeight: MIN_TEXTAREA_HEIGHT,
        resize: "none",
      }}
      className={className}
    />
  )
}

export default ExpandingTextArea
