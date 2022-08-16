import { useEffect, useState } from "react"
import { BlitzPage, useMutation, useRouter, Routes, Image, Router, useSession } from "blitz"
import { trackClick, trackImpression, trackError } from "app/utils/amplitude"
import { TRACKING_EVENTS } from "app/core/utils/constants"
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
import Back from "/public/back-icon.svg"
import useStore from "app/core/hooks/useStore"
import Layout from "app/core/layouts/Layout"
import { sendTerminalCreationNotification } from "app/utils/sendTerminalCreatedNotification"
import { parseUniqueAddresses } from "app/core/utils/parseUniqueAddresses"

const {
  PAGE_NAME,
  FEATURE: { NEW_STATION },
} = TRACKING_EVENTS

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
              alt="Station profile picture uploaded by the user."
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
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const router = useRouter()
  const setToastState = useStore((state) => state.setToastState)
  const [pfpURL, setPfpURL] = useState<string>("")
  const [createTerminalMutation] = useMutation(createTerminal)
  const activeUser = useStore((state) => state.activeUser)

  useEffect(() => {
    trackImpression(NEW_STATION.EVENT_NAME.CREATE_STATION_PAGE_SHOWN, {
      userAddress: activeUser?.address,
      pageName: PAGE_NAME.STATION_CREATION_PAGE,
    })
  }, [])

  return (
    <Layout>
      <div className="h-screen">
        <div
          className="absolute top-4 left-4 cursor-pointer"
          onClick={() => {
            trackClick(NEW_STATION.EVENT_NAME.CREATE_STATION_BACK_BUTTON_CLICKED, {
              userAddress: activeUser?.address,
              pageName: PAGE_NAME.STATION_CREATION_PAGE,
            })
            Router.back()
          }}
        >
          <Image src={Back} alt="Close button" width={16} height={16} />
        </div>
        <main className="text-marble-white h-full max-w-screen-sm sm:mx-auto mb-5 box-border">
          {session.userId ? (
            <div className="w-[31rem]">
              <div className="flex flex-row pt-16">
                <div className="mr-1">
                  <div className="w-60 h-1 bg-electric-violet" />
                  <p className="text-electric-violet mt-2.5">Open a station</p>
                </div>
                <div>
                  <div className="w-60 h-1 bg-concrete" />
                  <p className="text-concrete mt-2.5">Create a Checkbook</p>
                </div>
              </div>
              <h2 className="text-2xl font-bold mt-12">Open a station</h2>
              <h6 className="mt-2">
                A station is where community members propose, coordinate, and fund ideas. Let&apos;s
                get started.
              </h6>
              <Form
                initialValues={{
                  // Note: this isn't the best UX, but we're pre-populating the active user's address
                  // as an admin for context that they will automatically be made an admin.
                  // Even if they remove it from the form field, we're still adding them as an admin
                  // in the station creation mutation itself as a precautionary measure they can make
                  // follow-up changes. If they really want to they can remove themselves later in settings.
                  adminAddresses: session.siwe?.address,
                }}
                onSubmit={async (
                  values: {
                    name: string
                    handle: string
                    pfpURL?: string
                    adminAddresses: string
                  },
                  form
                ) => {
                  trackClick(NEW_STATION.EVENT_NAME.CREATE_STATION_CREATE_CONTINUTE_CLICKED, {
                    userAddress: activeUser?.address,
                    pageName: PAGE_NAME.STATION_CREATION_PAGE,
                  })
                  if (
                    session.userId !== null &&
                    !Object.keys(form.getState().errors || {}).length
                  ) {
                    try {
                      const terminal = await createTerminalMutation({
                        ...values,
                        adminAddresses: parseUniqueAddresses(values.adminAddresses || ""),
                        pfpURL,
                      })
                      if (window !== undefined && window.location.host === "app.station.express") {
                        sendTerminalCreationNotification(
                          values.name,
                          values.handle,
                          `https://${window.location.host}`,
                          process.env.BLITZ_PUBLIC_STATION_DISCORD_SERVER_WEBHOOK
                        )
                      }
                      router.push(
                        Routes.NewCheckbookTerminalCreationPage({ terminalHandle: terminal.handle })
                      )
                    } catch (err) {
                      trackError(NEW_STATION.EVENT_NAME.ERROR_CREATING_STATION, {
                        userAddress: activeUser?.address,
                        pageName: PAGE_NAME.STATION_CREATION_PAGE,
                        stationHandle: values.handle,
                      })
                      setToastState({
                        isToastShowing: true,
                        type: "error",
                        message: err.toString(),
                      })
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
                          <label className="font-bold">Station name*</label>
                          <span className="text-concrete text-xs">50 characters max</span>
                          <Field
                            name="name"
                            component="input"
                            placeholder="e.g. Sushi DAO"
                            validate={composeValidators(
                              mustBeUnderNumCharacters(50),
                              requiredField
                            )}
                            className="w-full rounded bg-wet-concrete border border-concrete px-2 py-1 mt-2 mb-1"
                          />
                          <span className="text-torch-red text-xs">
                            {formState.touched && formState?.touched["name"] && errors?.name}
                          </span>
                          <label className="font-bold mt-6">Station handle*</label>
                          <span className="text-concrete text-xs">50 characters max</span>
                          <Field
                            name="handle"
                            component="input"
                            placeholder="e.g. sushiDAO"
                            validate={composeValidators(
                              mustBeUnderNumCharacters(50),
                              requiredField
                            )}
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
                                  <span className=" text-xs text-torch-red block">
                                    {meta.error}
                                  </span>
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
                                  <Image
                                    src={GithubIcon}
                                    alt="Github Icon."
                                    width={14}
                                    height={14}
                                  />
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
                                  <Image
                                    src={TikTokIcon}
                                    alt="TikTok Icon."
                                    width={14}
                                    height={14}
                                  />
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
                          <label className="font-bold mt-6">Admin addresses</label>
                          <span className="text-xs text-concrete block w-3/4 sm:w-[474px]">
                            Insert wallet addresses that are allowed to manage Station settings and
                            information. Addresses should be comma-separated.
                          </span>
                          <Field name="adminAddresses" component="textarea">
                            {({ input, meta }) => (
                              <div>
                                <textarea
                                  {...input}
                                  className="w-3/4 sm:w-[474px] bg-wet-concrete border border-light-concrete rounded p-2 mt-2"
                                  rows={6}
                                  placeholder="Enter wallet addresses"
                                />
                                {/* user feedback on number of registered unique addresses, not an error */}
                                {input && (
                                  <span className=" text-xs text-marble-white ml-2 mb-2 block">
                                    {`${
                                      parseUniqueAddresses(input.value || "").length
                                    } unique addresses detected`}
                                  </span>
                                )}
                                {errors?.adminAddresses && (
                                  <span className=" text-xs text-torch-red mb-2 block">
                                    {errors?.adminAddresses}
                                  </span>
                                )}
                              </div>
                            )}
                          </Field>
                        </div>
                        <div className="mt-14 mb-12">
                          <button
                            className="rounded text-tunnel-black px-8 h-[35px] bg-electric-violet hover:opacity-70"
                            type="submit"
                            onClick={(e) => {
                              // Note: this onclick handler will be called in addition to the submit call
                              if (Object.keys(form.getState().errors || {}).length) {
                                setToastState({
                                  isToastShowing: true,
                                  type: "error",
                                  message: "Please fill out required fields",
                                })
                                return
                              }
                            }}
                          >
                            Create & continue
                          </button>
                        </div>
                      </div>
                    </form>
                  )
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0 pb-20">
              <h1 className="text-2xl font-bold text-marble-white text-center w-[330px]">
                You&apos;re on your way to create a station.
              </h1>
              <p className="my-2 w-[309px] text-center">
                Connect your wallet to start funding proposals and legitmizing contributors.
              </p>
              <button
                onClick={() => toggleWalletModal(true)}
                className="bg-electric-violet text-tunnel-black h-[35px] px-5 rounded hover:opacity-70 mt-5"
              >
                Connect wallet
              </button>
            </div>
          )}
        </main>
      </div>
    </Layout>
  )
}

CreateTerminalDetailsPage.suppressFirstRenderFlicker = true
export default CreateTerminalDetailsPage
