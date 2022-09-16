import { useState } from "react"
import Preview from "app/core/components/MarkdownPreview"

const MAX_CHAR_LENGTH = 1000

export const ReadMore = ({
  children = "",
  className,
}: {
  children?: string
  className?: string
}) => {
  const text = children
  const [isReadMore, setIsReadMore] = useState(true)
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore)
  }
  const isOverflow = text?.length > MAX_CHAR_LENGTH
  return (
    <div className={className}>
      <Preview
        markdown={isReadMore && isOverflow ? text?.slice(0, MAX_CHAR_LENGTH) + "..." : text}
      />
      {isOverflow && (
        <button onClick={toggleReadMore} className="font-bold text-electric-violet mt-3">
          {isReadMore ? "Read more" : "Show less"}
        </button>
      )}
    </div>
  )
}

export default ReadMore
