import { Field } from "react-final-form"
import PreviewEditor from "./MarkdownPreview"

export const TextareaFieldOrMarkdownPreview = ({
  previewMode,
  setPreviewMode,
  markdown,
  fieldName,
}) => {
  return (
    <Field name={fieldName}>
      {({ input, meta }) => (
        <>
          {previewMode ? (
            <PreviewEditor
              markdown={markdown}
              className="mt-1 p-2 bg-wet-concrete text-marble-white rounded min-h-[180px] w-full"
              onClick={() => {
                setPreviewMode(false)
              }}
            />
          ) : (
            <textarea
              {...input}
              autoFocus
              placeholder={`# Summary\n\n# Deliverables\n\n# Timeline`}
              className="mt-1 p-2 bg-wet-concrete text-marble-white rounded min-h-[180px] w-full"
            />
          )}
          {/* this error shows up when the user focuses the field (meta.touched) */}
          {meta.error && meta.touched && (
            <span className=" text-xs text-torch-red block">{meta.error}</span>
          )}
        </>
      )}
    </Field>
  )
}

export default TextareaFieldOrMarkdownPreview
