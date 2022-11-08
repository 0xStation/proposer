import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"

export const ReadEditMarkdownButton = ({ previewMode, setPreviewMode }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        setPreviewMode(!previewMode)
      }}
    >
      <div className="flex flex-row items-center space-x-1">
        <p className="inline text-sm text-concrete">{previewMode ? "Edit" : "Read"}</p>
        {previewMode ? (
          <EyeOffIcon className="inline h-4 w-4 fill-concrete" />
        ) : (
          <EyeIcon className="inline h-4 w-4 fill-concrete" />
        )}
      </div>
    </button>
  )
}

export default ReadEditMarkdownButton
