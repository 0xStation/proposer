import { useState, useEffect, useMemo } from "react"
import {
  BlitzPage,
  useParam,
  useQuery,
  useMutation,
  useRouter,
  GetServerSideProps,
  invoke,
  getSession,
} from "blitz"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import Navigation from "app/terminal/components/settings/navigation"
import updateTerminal from "app/terminal/mutations/updateTerminal"
import { useDropzone } from "react-dropzone"
import UploadIcon from "app/core/icons/UploadIcon"
import { Field, Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import { canEdit } from "app/core/utils/permissions"
import { EditPermissionTypes } from "app/core/utils/constants"
import { mustBeUnderNumCharacters } from "app/utils/validators"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"

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

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  const session = await getSession(req, res)

  if (!session?.userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  const terminal = await invoke(getTerminalByHandle, { handle: params?.terminalHandle as string })

  if (!terminal?.data?.permissions?.accountWhitelist?.includes(session?.userId as number)) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
}

const TerminalSettingsPage: BlitzPage = () => {
  const router = useRouter()
  const setToastState = useStore((state) => state.setToastState)
  const activeUser = useStore((state) => state.activeUser)
  const [pfpURL, setPfpURL] = useState<string>("")
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

  const userCanEdit = activeUser
    ? canEdit(activeUser, terminal?.id, EditPermissionTypes.TERMINAL)
    : false

  const [updateTerminalMutation] = useMutation(updateTerminal, {
    onSuccess: (data) => {
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Successfully updated your terminal.",
      })

      let route = `/terminal/${data?.handle || terminalHandle}/settings/terminal`
      router.push(route, undefined, { shallow: true })
    },
    onError: (error: Error) => {
      console.error("Failed to update terminal with error: ", error)
      setToastState({ isToastShowing: true, type: "error", message: "Something went wrong!" })
    },
  })

  useEffect(() => {
    // initialize pfpInput with terminal's pre-existing images
    setPfpURL(terminal?.data?.pfpURL || "")
  }, [terminal?.data?.pfpURL])

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <section className="flex-1">
          {!terminal ? (
            <div>loading terminal...</div>
          ) : (
            <Form
              initialValues={{ name: terminal.data.name, handle: terminal.handle } || {}}
              onSubmit={async (values) => {
                await updateTerminalMutation({
                  ...values,
                  pfpURL: pfpURL,
                  id: terminal.id,
                })
              }}
              render={({ form, handleSubmit }) => {
                let formState = form.getState()
                let errors = formState.errors
                return (
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                      <div className="p-6 border-b border-concrete flex justify-between">
                        <h2 className="text-marble-white text-2xl font-bold">Terminal Overview</h2>
                        <button
                          className={`rounded text-tunnel-black px-8 ${
                            formState.hasValidationErrors ? "bg-light-concrete" : "bg-magic-mint"
                          }`}
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
                              validate={mustBeUnderNumCharacters(50)}
                              className="w-1/2 rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2"
                            />
                            <span className="text-torch-red text-xs">{errors?.name}</span>
                            <label className="font-bold mt-4">Terminal Handle*</label>
                            <span className="text-concrete text-xs mt-1">50 characters max.</span>
                            <Field
                              name="handle"
                              component="input"
                              validate={mustBeUnderNumCharacters(50)}
                              className="w-1/2 rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2 mb-4"
                            />
                            <span className="text-torch-red text-xs">{errors?.handle}</span>
                            <PfpInput pfpURL={pfpURL} onUpload={(url) => setPfpURL(url)} />
                          </div>
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
    </LayoutWithoutNavigation>
  )
}

TerminalSettingsPage.suppressFirstRenderFlicker = true

export default TerminalSettingsPage
