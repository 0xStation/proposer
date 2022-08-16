import { useState } from "react"
import { useDropzone } from "react-dropzone"
import useStore from "app/core/hooks/useStore"
import { Spinner } from "app/core/components/Spinner"

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
      className="text-marble-white border border-marble-white mr-2 py-1 px-4 w-36 h-[35px] rounded hover:opacity-75"
      disabled={isLoading}
      {...getRootProps()}
    >
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Spinner fill="marble-white" />
        </div>
      ) : (
        "Upload image"
      )}
      <input {...getInputProps()} />
    </button>
  )
}

export default UploadImageButton
