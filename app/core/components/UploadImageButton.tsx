import { useState } from "react"
import { useDropzone } from "react-dropzone"
import useStore from "app/core/hooks/useStore"
import { Spinner } from "app/core/components/Spinner"

// ;<div
//   className="space-x-1 items-center flex cursor-pointer"
//   onClick={() => setPreviewMode(!previewMode)}
// >
//   {previewMode ? (
//     <>
//       <img src="/pencil.svg" className="inline pr-2 self-center" />
//       <span>Back to editing</span>
//     </>
//   ) : (
//     <>
//       <img src="/eye.svg" className="inline pr-2 items-center" />
//       <span>Preview</span>
//     </>
//   )}
// </div>
const UploadImageButton = () => {
  const setToastState = useStore((state) => state.setToastState)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const uploadFile = async (acceptedFiles) => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", acceptedFiles[0])

    const fileName = acceptedFiles[0].path
    let url

    try {
      let res = await fetch("/api/uploadImage", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      url = data.url
      setIsLoading(false)
    } catch (e) {
      console.error(e)
      setIsLoading(false)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "File upload failed.",
      })
      return
    }

    navigator.clipboard.writeText(`![${fileName}](${url})`).then(() => {
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Copied file link, ready to paste in editor.",
      })
    })
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: uploadFile,
    accept: "image/*",
  })

  return (
    <button
      type="button"
      className="text-marble-white h-[35px] rounded hover:opacity-75 flex items-center"
      disabled={isLoading}
      {...getRootProps()}
    >
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Spinner fill="marble-white" />
        </div>
      ) : (
        <>
          <img src="/image.svg" className="inline pr-2 self-center" />
          <span>Upload image</span>
        </>
      )}
      <input {...getInputProps()} />
    </button>
  )
}

export default UploadImageButton
