import { useState, useEffect } from "react"
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
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
import {
  composeValidators,
  mustBeUnderNumCharacters,
  requiredField,
  isAddress,
} from "app/utils/validators"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import arrayMutators from "final-form-arrays"
import { FieldArray } from "react-final-form-arrays"
import { TrashIcon } from "@heroicons/react/solid"
import hasAdminPermissionsBasedOnTags from "app/permissions/queries/hasAdminPermissionsBasedOnTags"

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
        className="w-24 h-24 border rounded-xl border-wet-concrete flex items-center justify-center cursor-pointer mt-2"
        {...getRootProps()}
      >
        <>
          <img
            alt="Profile picture uploaded by the user."
            src={pfpURL}
            className="w-full h-full rounded-xl object-cover"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_PFP_URLS.TERMINAL
            }}
          />
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

  const hasTagAdminPermissions = await invoke(hasAdminPermissionsBasedOnTags, {
    terminalId: terminal?.id as number,
    accountId: session?.userId as number,
  })

  if (
    !terminal?.data?.permissions?.accountWhitelist?.includes(session?.siwe?.address as string) &&
    !hasTagAdminPermissions
  ) {
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
  const [pfpURL, setPfpURL] = useState<string>("")
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

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
              mutators={{
                ...arrayMutators,
              }}
              onSubmit={async (values) => {
                try {
                  await updateTerminalMutation({
                    ...values,
                    pfpURL: pfpURL,
                    id: terminal.id,
                  })
                } catch (err) {
                  console.error("Failed to update terminal with error: ", err)
                  setToastState({
                    isToastShowing: true,
                    type: "error",
                    message: "Something went wrong!",
                  })
                }
              }}
              render={({ form, handleSubmit }) => {
                let formState = form.getState()
                let errors = formState.errors
                return (
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                      <div className="p-6 border-b border-concrete flex justify-between">
                        <h2 className="text-marble-white text-2xl font-bold">Terminal overview</h2>
                        <button
                          className={`rounded text-tunnel-black px-8 bg-electric-violet ${
                            formState.hasValidationErrors || !formState.dirty
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-opacity-70"
                          }`}
                          disabled={formState.hasValidationErrors || !formState.dirty}
                          type="submit"
                        >
                          Save
                        </button>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex flex-col pb-2 col-span-2">
                            <label className="font-bold">Terminal name*</label>
                            <span className="text-concrete text-xs">50 characters max.</span>
                            <Field
                              name="name"
                              component="input"
                              validate={composeValidators(
                                mustBeUnderNumCharacters(50),
                                requiredField
                              )}
                              className="w-3/4 sm:w-[474px] rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2"
                            />
                            <span className="text-torch-red text-xs">{errors?.name}</span>
                            <label className="font-bold mt-6">Terminal handle*</label>
                            <span className="text-concrete text-xs">50 characters max.</span>
                            <Field
                              name="handle"
                              component="input"
                              validate={composeValidators(
                                mustBeUnderNumCharacters(50),
                                requiredField
                              )}
                              className="w-3/4 sm:w-[474px] rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2 mb-6"
                            />
                            <span className="text-torch-red text-xs">{errors?.handle}</span>
                            <PfpInput pfpURL={pfpURL} onUpload={(url) => setPfpURL(url)} />
                            <h3 className="font-bold mt-4">Admin addresses</h3>
                            <span className="text-xs text-concrete block w-3/4 sm:w-[474px]">
                              Insert wallet addresses that are allowed to manage Terminal settings
                              and information. Addresses should be comma-separated.
                            </span>
                            <FieldArray name="adminAddresses">
                              {({ fields }) => (
                                <div>
                                  {fields.map((name, index) => (
                                    <div key={index}>
                                      <Field name={`${name}`} validate={isAddress}>
                                        {({ input, meta }) => (
                                          <>
                                            <input
                                              {...input}
                                              type="text"
                                              placeholder="Wallet address"
                                              className="w-3/4 sm:w-[474px] rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2 text-marble-white"
                                            />
                                            {meta.error && meta.touched && (
                                              <span className="text-xs text-torch-red mt-1 mb-1 block">
                                                {meta.error}
                                              </span>
                                            )}
                                          </>
                                        )}
                                      </Field>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    className="pt-2 text-electric-violet"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      fields.push("")
                                    }}
                                  >
                                    + Add admin
                                  </button>
                                  {fields && fields.length ? (
                                    <button
                                      type="button"
                                      className="pl-8 text-torch-red"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        fields.pop()
                                      }}
                                    >
                                      <TrashIcon className="w-4 h-4 fill-torch-red inline mr-1 mb-1" />
                                      Remove
                                    </button>
                                  ) : null}
                                </div>
                              )}
                            </FieldArray>
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
