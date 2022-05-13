import { useState } from "react"
import { BlitzPage, useMutation, useRouter, Image, Router, useSession } from "blitz"
import createTerminal from "app/terminal/mutations/createTerminal"
import { Field, Form } from "react-final-form"
import { useDropzone } from "react-dropzone"
import useToast from "app/core/hooks/useToast"
import UploadIcon from "app/core/icons/UploadIcon"
import { composeValidators, requiredField, mustBeUnder50Chars } from "app/utils/validators"
import Exit from "/public/exit-button.svg"

const PfpInput = ({ pfpURL, onUpload }) => {
  const uploadFile = async (acceptedFiles) => {
    const formData = new FormData()
    formData.append("file", acceptedFiles[0])
    let res = await fetch("/api/uploadImage", {
      method: "POST",
      body: formData,
    })

    try {
      const data = await res.json()
      onUpload(data.url)
    } catch (err) {
      console.error(err)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: uploadFile,
    accept: "image/jpeg, image/jpg, image/png",
  })

  return (
    <div className="flex flex-col">
      <label className="font-bold text-base">Logo</label>
      <span className="text-concrete text-xs mt-1">.jpg or .png</span>
      <div
        className="w-24 h-24 border rounded-xl bg-gradient-to-b object-cover from-electric-violet to-magic-mint border-concrete flex items-center justify-center cursor-pointer mt-2"
        {...getRootProps()}
      >
        <>
          {pfpURL && (
            <img
              alt="Profile picture uploaded by the user."
              src={pfpURL}
              className="w-full h-full rounded-xl"
            />
          )}
          <span className="absolute z-10">
            <UploadIcon />
          </span>
          <div className="rounded-full bg-tunnel-black opacity-50 h-5 w-5 absolute">
            <span className=" h-full w-full"></span>
          </div>
          <input {...getInputProps()} />
        </>
      </div>
    </div>
  )
}

const CreateTerminalDetailsPage: BlitzPage = () => {
  const session = useSession({ suspense: false })
  const router = useRouter()
  const [addToast, Toast] = useToast()
  const [pfpURL, setPfpURL] = useState<string>("")
  const [createTerminalMutation] = useMutation(createTerminal, {
    onSuccess: (_data) => {
      // go to the terminal page? Do we even have one yet?
      let route = `/`
      router.push(route, undefined, { shallow: true })
    },
    onError: (error: Error) => {
      console.error(error)
      addToast(error.toString(), "error")
    },
  })

  return (
    <main className="text-marble-white min-h-screen max-w-screen-sm mx-auto">
      <div
        className="absolute top-4 left-4 cursor-pointer"
        onClick={() => {
          Router.back()
        }}
      >
        <Image src={Exit} alt="Close button" width={12} height={12} />
      </div>
      <h2 className="text-2xl font-bold pt-16">Open a Terminal</h2>
      <h6 className="mt-2">
        Terminal is where members of your community collaborate and make decisions. Tell us about
        your Terminal.
      </h6>
      <Form
        initialValues={{}}
        onSubmit={async (values: { name: string; handle: string; pfpURL?: string }) => {
          await createTerminalMutation({
            ...values,
            pfpURL,
          })
        }}
        render={({ form, handleSubmit }) => {
          let formState = form.getState()
          let errors = formState.errors
          return (
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="flex flex-col">
                <div className="flex flex-col pb-2 col-span-2">
                  <label className="font-bold">Terminal Name*</label>
                  <span className="text-concrete text-xs mt-1">50 characters max.</span>
                  <Field
                    name="name"
                    component="input"
                    validate={composeValidators(mustBeUnder50Chars, requiredField)}
                    className="w-full rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2 mb-1"
                  />
                  <span className="text-torch-red text-xs">{errors?.name}</span>
                  <label className="font-bold mt-4">Terminal Handle*</label>
                  <span className="text-concrete text-xs mt-1">50 characters max.</span>
                  <Field
                    name="handle"
                    component="input"
                    validate={composeValidators(mustBeUnder50Chars, requiredField)}
                    className="w-full rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2 mb-1"
                  />
                  <span className="text-torch-red text-xs">{errors?.handle}</span>
                  <div className="mt-4">
                    <PfpInput pfpURL={pfpURL} onUpload={(url) => setPfpURL(url)} />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    className={`rounded text-tunnel-black px-8 py-1 ${
                      formState.hasValidationErrors ? "bg-light-concrete" : "bg-magic-mint"
                    }`}
                    type="submit"
                  >
                    Open
                  </button>
                </div>
              </div>
            </form>
          )
        }}
      />
      <Toast />
    </main>
  )
}

CreateTerminalDetailsPage.suppressFirstRenderFlicker = true
export default CreateTerminalDetailsPage
