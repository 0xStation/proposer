import { useState } from "react"
import { BlitzPage, useMutation, useRouter, Routes, Image, Router, useSession } from "blitz"
import PersonalSiteIcon from "public/personal-site-icon.svg"
import TwitterIcon from "public/twitter-icon.svg"
import GithubIcon from "public/github-icon.svg"
import TikTokIcon from "public/tiktok-icon.svg"
import InstagramIcon from "public/instagram-icon.svg"
import createTerminal from "app/terminal/mutations/createTerminal"
import { Field, Form } from "react-final-form"
import { useDropzone } from "react-dropzone"
import UploadIcon from "app/core/icons/UploadIcon"
import {
  composeValidators,
  requiredField,
  mustBeUnderNumCharacters,
  mustBeUrl,
} from "app/utils/validators"
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
      <span className="text-concrete text-xs">.jpg or .png, 600px x 600px recommended.</span>
      <div
        className="w-24 h-24 border rounded-xl bg-gradient-to-b object-cover from-electric-violet to-magic-mint border-concrete flex items-center justify-center cursor-pointer mt-2"
        {...getRootProps()}
      >
        <>
          {pfpURL && (
            <img
              alt="Terminal profile picture uploaded by the user."
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
      <main className="text-marble-white min-h-screen max-w-screen-sm sm:mx-auto m-5">
        <div
          className="absolute top-4 left-4 cursor-pointer"
          onClick={() => {
            Router.back()
          }}
        >
          <Image src={Exit} alt="Close button" width={12} height={12} />
        </div>
        {session.userId ? (
          <div className="w-[31rem]">
            <div className="flex flex-row mt-16">
              <div className="mr-1">
                <div className="w-60 h-1 bg-electric-violet" />
                <p className="text-electric-violet mt-2.5">Open a Terminal</p>
              </div>
              <div className="">
                <div className="w-60 h-1 bg-concrete" />
                <p className="text-concrete mt-2.5">Create a Checkbook</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold mt-12">Open a Terminal</h2>
            <h6 className="mt-2">
              A Terminal is where community members propose, coordinate, and fund ideas. Let&apos;s
              get started.
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
                    if (window !== undefined && window.location.host === "app.station.express") {
                      sendTerminalCreationNotification(
                        values.name,
                        values.handle,
                        `https://${window.location.host}`,
                        process.env.BLITZ_PUBLIC_STATION_DISCORD_SERVER_WEBHOOK
                      )
                    }
                  } catch (err) {
                    setToastState({ isToastShowing: true, type: "error", message: err.toString() })
                  }
                }
              }}
              render={({ form, handleSubmit }) => {
                let formState = form.getState()
                let errors = formState.errors
                return (
                  <form onSubmit={handleSubmit} className="mt-9">
                    <div className="flex flex-col">
                      <div className="flex flex-col pb-2 col-span-2">
                        <label className="font-bold">Terminal name*</label>
                        <span className="text-concrete text-xs">50 characters max</span>
                        <Field
                          name="name"
                          component="input"
                          placeholder="e.g. Sushi DAO"
                          validate={composeValidators(mustBeUnderNumCharacters(50), requiredField)}
                          className="w-full rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2 mb-1"
                        />
                        <span className="text-torch-red text-xs">
                          {formState.touched && formState?.touched["name"] && errors?.name}
                        </span>
                        <label className="font-bold mt-6">Terminal handle*</label>
                        <span className="text-concrete text-xs">50 characters max</span>
                        <Field
                          name="handle"
                          component="input"
                          placeholder="e.g. sushiDAO"
                          validate={composeValidators(mustBeUnderNumCharacters(50), requiredField)}
                          className="w-full rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2 mb-1"
                        />
                        <span className="text-torch-red text-xs">
                          {formState.touched && formState?.touched["handle"] && errors?.handle}
                        </span>
                        <label className="font-bold mt-6">Description</label>
                        <span className="text-concrete text-xs">150 characters max</span>
                        <Field
                          component="textarea"
                          name="description"
                          validate={mustBeUnderNumCharacters(150)}
                        >
                          {({ input, meta }) => (
                            <div>
                              <textarea
                                {...input}
                                placeholder="$SUSHIDAO is the decentralized reserve currency of DeFi."
                                className="mt-2 border border-concrete bg-wet-concrete text-marble-white p-2 rounded min-h-[112px] w-full"
                              />
                              {/* this error shows up when the user focuses the field (meta.touched) */}
                              {meta.error && meta.touched && (
                                <span className=" text-xs text-torch-red block">{meta.error}</span>
                              )}
                            </div>
                          )}
                        </Field>
                        <div className="mt-6">
                          <PfpInput pfpURL={pfpURL} onUpload={(url) => setPfpURL(url)} />
                        </div>
                      </div>
                      <div className="flex flex-col mt-6">
                        <label className="mb-2 font-bold text-base">Socials</label>
                        <Field name="contactUrl" validate={mustBeUrl}>
                          {({ input, meta }) => (
                            <div className="h-10 w-full border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
                              <div className="py-2 px-3 mx-1 w-[2%] inline border-r border-concrete h-full">
                                <Image
                                  src={PersonalSiteIcon}
                                  alt="Personal Site Icon."
                                  width={14}
                                  height={14}
                                />
                              </div>
                              <input
                                {...input}
                                type="text"
                                placeholder="e.g. https://mirror.xyz/sushiDAO"
                                className="h-full inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                              />
                              {/* this error shows up when the user focuses the field (meta.touched) */}
                              {meta.error && meta.touched && (
                                <span className="text-xs text-torch-red block">{meta.error}</span>
                              )}
                            </div>
                          )}
                        </Field>
                        <Field name="twitterUrl" validate={mustBeUrl}>
                          {({ input, meta }) => (
                            <div className="h-10 w-full border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
                              <div className="py-2 px-3 mx-1 w-[2%] inline border-r border-concrete h-full">
                                <Image
                                  src={TwitterIcon}
                                  alt="Twitter Icon."
                                  width={14}
                                  height={14}
                                />
                              </div>
                              <input
                                {...input}
                                type="text"
                                placeholder="e.g. https://twitter.com/sushiDAO"
                                className="h-full inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                              />
                              {/* this error shows up when the user focuses the field (meta.touched) */}
                              {meta.error && meta.touched && (
                                <span className="text-xs text-torch-red mb-2 block">
                                  {meta.error}
                                </span>
                              )}
                            </div>
                          )}
                        </Field>
                        <Field name="githubUrl" validate={mustBeUrl}>
                          {({ input, meta }) => (
                            <div className="h-10 w-full border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
                              <div className="py-2 px-3 mx-1 w-[2%] inline border-r border-concrete h-full">
                                <Image src={GithubIcon} alt="Github Icon." width={14} height={14} />
                              </div>
                              <input
                                {...input}
                                type="text"
                                placeholder="e.g. https://github.com/sushiDAO"
                                className="h-full inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                              />
                              {/* this error shows up when the user focuses the field (meta.touched) */}
                              {meta.error && meta.touched && (
                                <span className=" text-xs text-torch-red mb-2 block">
                                  {meta.error && meta.touched && meta.error}
                                </span>
                              )}
                            </div>
                          )}
                        </Field>
                        <Field name="tiktokUrl" validate={mustBeUrl}>
                          {({ input, meta }) => (
                            <div className="h-10 w-full border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
                              <div className="py-2 px-3 mx-1 w-[2%] inline border-r border-concrete h-full">
                                <Image src={TikTokIcon} alt="TikTok Icon." width={14} height={14} />
                              </div>
                              <input
                                {...input}
                                type="text"
                                placeholder="e.g. https://tiktok.com/sushiDAO"
                                className="h-full inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                              />
                              {/* this error shows up when the user focuses the field (meta.touched) */}
                              {meta.error && meta.touched && (
                                <span className=" text-xs text-torch-red mb-2 block">
                                  {meta.error}
                                </span>
                              )}
                            </div>
                          )}
                        </Field>
                        <Field name="instagramUrl" validate={mustBeUrl}>
                          {({ input, meta }) => (
                            <div className="h-10 w-full border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
                              <div className="py-2 px-3 mx-1 w-[2%] inline border-r border-concrete h-full">
                                <Image
                                  src={InstagramIcon}
                                  alt="Instagram Icon."
                                  width={14}
                                  height={14}
                                />
                              </div>
                              <input
                                {...input}
                                type="text"
                                placeholder="e.g. https://instagram.com/sushiDAO"
                                className="h-full inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                              />
                              {/* this error shows up when the user focuses the field (meta.touched) */}
                              {meta.error && meta.touched && (
                                <span className=" text-xs text-torch-red mb-2 block">
                                  {meta.error}
                                </span>
                              )}
                            </div>
                          )}
                        </Field>
                      </div>
                      <div className="mt-14">
                        <button
                          className="rounded text-tunnel-black px-8 py-1 bg-electric-violet hover:opacity-70"
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
          </div>
        ) : (
          <div>You need to have an account to create a terminal.</div>
        )}
      </main>
    </LayoutWithoutNavigation>
  )
}

CreateTerminalDetailsPage.suppressFirstRenderFlicker = true
export default CreateTerminalDetailsPage
