import { useState, useEffect, useMemo } from "react"
import { BlitzPage, useParam, useQuery, useMutation } from "blitz"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import Navigation from "app/terminal/components/settings/navigation"
import useToast from "app/core/hooks/useToast"
import updateTerminal from "app/terminal/mutations/updateTerminal"
import { useDropzone } from "react-dropzone"
import UploadIcon from "app/core/icons/UploadIcon"
import { Field, Form } from "react-final-form"

// maybe we can break this out into it's own component?
const PfpInput = ({ pfpURL, onUpload }) => {
  const uploadFile = async (acceptedFiles) => {
    const formData = new FormData()
    formData.append("file", acceptedFiles[0])
    let res = await fetch("/api/uploadImage", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    onUpload(data.url)
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: uploadFile,
    accept: "image/jpeg, image/jpg, image/png",
  })

  return (
    <div className="flex-col">
      <label className="font-bold text-base">PFP</label>
      <div
        className="w-24 h-24 border rounded-xl bg-gradient-to-b object-cover from-electric-violet to-magic-mint border-concrete flex items-center justify-center cursor-pointer mt-4"
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

const TerminalSettingsPage: BlitzPage = () => {
  const [pfpURL, setPfpURL] = useState<string>("")
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const [addToast, Toast] = useToast()

  const [updateTerminalMutation] = useMutation(updateTerminal, {
    onSuccess: (data) => {
      console.log(data)
      addToast("Successfully updated your terminal.")

      // if terminal handle changes it is going to break the routes
      // if the users refreshes for example, it is not going to work because their handle is different
      // so we should auto refresh with the new handle possibly?
    },
    onError: (error) => {
      console.log(error)
      // error toast
    },
  })

  useEffect(() => {
    // initialize pfpInput with terminal's pre-existing images
    setPfpURL(terminal?.data?.pfpURL || "")
  }, [terminal?.data?.pfpURL])

  return (
    <Navigation>
      <section className="flex-1">
        {!terminal ? (
          <div>loading terminal...</div>
        ) : (
          <Form
            initialValues={{ name: terminal.data.name, handle: terminal.handle } || {}}
            onSubmit={async (values) => {
              console.log(values)
              await updateTerminalMutation({
                ...values,
                pfpURL: pfpURL,
                id: terminal.id,
              })
            }}
            render={({ form, handleSubmit }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col">
                    <div className="p-6 border-b border-concrete flex justify-between">
                      <h2 className="text-marble-white text-2xl font-bold">Terminal Overview</h2>
                      <button
                        className="rounded text-tunnel-black bg-magic-mint px-8"
                        type="submit"
                      >
                        Save
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col pb-2 col-span-2">
                          <label className="font-bold">Terminal Name*</label>
                          <span className="text-concrete text-xs mt-1">50 characters max.</span>
                          <Field
                            name="name"
                            component="input"
                            className="w-1/2 rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2"
                          />
                          <label className="font-bold mt-4">Terminal Handle*</label>
                          <span className="text-concrete text-xs mt-1">50 characters max.</span>
                          <Field
                            name="handle"
                            component="input"
                            className="w-1/2 rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2 mb-4"
                          />
                          <PfpInput pfpURL={pfpURL} onUpload={(url) => setPfpURL(url)} />
                        </div>
                        <Toast />
                      </div>
                    </div>
                  </div>
                </form>
              )
            }}
          />
        )}
      </section>
    </Navigation>
  )
}

TerminalSettingsPage.suppressFirstRenderFlicker = true

export default TerminalSettingsPage
