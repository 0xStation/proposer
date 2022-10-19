import { useState } from "react"
import Preview from "app/core/components/MarkdownPreview"

export const ReadMore = ({
  children = "",
  className,
  maxCharLength = 500,
}: {
  children?: string
  className?: string
  maxCharLength?: number
}) => {
  const text = children
  const [isReadMore, setIsReadMore] = useState(true)
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore)
  }
  const isOverflow = text?.length > maxCharLength
  return (
    <div className={className}>
      <Preview markdown={isReadMore && isOverflow ? text?.slice(0, maxCharLength) + "..." : text} />
      {isOverflow && (
        <button onClick={toggleReadMore} className="font-bold text-electric-violet mt-1">
          {isReadMore ? "Read more" : "Show less"}
        </button>
      )}
    </div>
  )
}

export default ReadMore
