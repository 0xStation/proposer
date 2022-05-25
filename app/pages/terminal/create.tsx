import { useState } from "react"
import { BlitzPage, useMutation, useRouter, Routes, Image, Router, useSession } from "blitz"
import createTerminal from "app/terminal/mutations/createTerminal"
import { Field, Form } from "react-final-form"
import { useDropzone } from "react-dropzone"
import UploadIcon from "app/core/icons/UploadIcon"
import { composeValidators, requiredField, mustBeUnderNumCharacters } from "app/utils/validators"
import Exit from "/public/exit-button.svg"
import useStore from "app/core/hooks/useStore"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import { sendTerminalCreationNotification } from "app/utils/sendTerminalCreatedNotification"

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
      <span className="text-concrete text-xs">.jpg or .png</span>
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
  const setToastState = useStore((state) => state.setToastState)
  const [pfpURL, setPfpURL] = useState<string>("")
  const [createTerminalMutation] = useMutation(createTerminal, {
    onSuccess: (data) => {
      router.push(Routes.MemberDirectoryPage({ terminalHandle: data.handle, tutorial: "true" }))
    },
  })

  return (
    <LayoutWithoutNavigation>
      <main className="text-marble-white min-h-screen max-w-screen-sm mx-auto">
        <div
          className="absolute top-4 left-4 cursor-pointer"
          onClick={() => {
            Router.back()
          }}
        >
          <Image src={Exit} alt="Close button" width={12} height={12} />
        </div>
        {session.userId ? (
          <>
            <h2 className="text-2xl font-bold pt-16">Open a Terminal</h2>
            <h6 className="mt-2">
              Terminal is where community members propose, coordinate, and fund ideas. Give it some
              bling.
            </h6>
            <Form
              initialValues={{}}
              onSubmit={async (values: { name: string; handle: string; pfpURL?: string }) => {
                if (session.userId !== null) {
                  try {
                    await createTerminalMutation({
                      ...values,
                      pfpURL,
                      accountId: session.userId,
                    })
                    sendTerminalCreationNotification(
                      values.name,
                      values.handle,
                      `https://${window.location.host}`,
                      process.env.STATION_DISCORD_SERVER_WEBHOOK
                    )
                  } catch (err) {
                    setToastState({ isToastShowing: true, type: "error", message: err.toString() })
                  }
                }
              }}
              render={({ form, handleSubmit }) => {
                let formState = form.getState()
                console.log(formState)
                let errors = formState.errors
                return (
                  <form onSubmit={handleSubmit} className="mt-12">
                    <div className="flex flex-col">
                      <div className="flex flex-col pb-2 col-span-2">
                        <label className="font-bold">Terminal name*</label>
                        <span className="text-concrete text-xs mb-2">50 characters max.</span>
                        <Field
                          name="name"
                          component="input"
                          validate={composeValidators(mustBeUnderNumCharacters(50), requiredField)}
                          className="w-full rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2 mb-1"
                        />
                        <span className="text-torch-red text-xs">
                          {formState.touched && formState?.touched["name"] && errors?.name}
                        </span>
                        <label className="font-bold mt-6">Terminal handle*</label>
                        <span className="text-concrete text-xs mb-2">50 characters max.</span>
                        <Field
                          name="handle"
                          component="input"
                          validate={composeValidators(mustBeUnderNumCharacters(50), requiredField)}
                          className="w-full rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2 mb-1"
                        />
                        <span className="text-torch-red text-xs">
                          {formState.touched && formState?.touched["handle"] && errors?.handle}
                        </span>
                        <div className="mt-6">
                          <PfpInput pfpURL={pfpURL} onUpload={(url) => setPfpURL(url)} />
                        </div>
                      </div>
                      <div className="mt-14">
                        <button
                          className={`rounded text-tunnel-black px-8 py-1 bg-magic-mint ${
                            formState.hasValidationErrors && "opacity-50"
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
          </>
        ) : (
          <div>You need to have an account to create a terminal.</div>
        )}
      </main>
    </LayoutWithoutNavigation>
  )
}

CreateTerminalDetailsPage.suppressFirstRenderFlicker = true
export default CreateTerminalDetailsPage
