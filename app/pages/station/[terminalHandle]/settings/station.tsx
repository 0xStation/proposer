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
  Image,
} from "blitz"
import PersonalSiteIcon from "public/personal-site-icon.svg"
import TwitterIcon from "public/twitter-icon.svg"
import GithubIcon from "public/github-icon.svg"
import TikTokIcon from "public/tiktok-icon.svg"
import InstagramIcon from "public/instagram-icon.svg"
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
  mustBeUrl,
  requiredField,
} from "app/utils/validators"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import hasAdminPermissionsBasedOnTags from "app/permissions/queries/hasAdminPermissionsBasedOnTags"
import { parseUniqueAddresses } from "app/core/utils/parseUniqueAddresses"
import getAdminAccountsForTerminal from "app/permissions/queries/getAdminAccountsForTerminal"
import Button from "app/core/components/sds/buttons/Button"

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
  const [adminAccounts] = useQuery(
    getAdminAccountsForTerminal,
    { terminalId: terminal?.id as number },
    { suspense: false }
  )

  const [updateTerminalMutation] = useMutation(updateTerminal, {
    onSuccess: (data) => {
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Successfully updated your terminal.",
      })

      let route = `/station/${data?.handle || terminalHandle}/settings/station`
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
            <div>loading station...</div>
          ) : (
            <Form
              initialValues={
                {
                  handle: terminal.handle,
                  adminAddresses: adminAccounts
                    ?.map((adminAccount) => adminAccount?.address)
                    ?.join(",\n"),
                  ...terminal.data,
                } || {}
              }
              onSubmit={async (values) => {
                try {
                  await updateTerminalMutation({
                    ...values,
                    adminAddresses: parseUniqueAddresses(values.adminAddresses || ""),
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
                        <h2 className="text-marble-white text-2xl font-bold">Station overview</h2>
                        <Button
                          label="Save"
                          isSubmitType={true}
                          isDisabled={formState.hasValidationErrors || !formState.dirty}
                        />
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex flex-col pb-2 col-span-2">
                            <label className="font-bold">Station name*</label>
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
                            <label className="font-bold mt-6">Station handle*</label>
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
                            <label className="font-bold">Description</label>
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
                                    className="w-3/4 sm:w-[474px] mt-2 mb-6 border border-concrete bg-wet-concrete text-marble-white p-2 rounded min-h-[112px]"
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
                            <PfpInput pfpURL={pfpURL} onUpload={(url) => setPfpURL(url)} />
                            <div className="flex flex-col mt-6">
                              <label className="mb-2 font-bold text-base">Socials</label>
                              <Field name="contactUrl" validate={mustBeUrl}>
                                {({ input, meta }) => (
                                  <div className="h-10 w-2/3 border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
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
                                      <span className="text-xs text-torch-red block">
                                        {meta.error}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </Field>
                              <Field name="twitterUrl" validate={mustBeUrl}>
                                {({ input, meta }) => (
                                  <div className="h-10 w-8/12 border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
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
                                  <div className="h-10 w-8/12 border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
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
                                  <div className="h-10 w-8/12 border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
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
                                  <div className="h-10 w-8/12 border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
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
                              <label className="font-bold mt-4">Admin addresses</label>
                              <span className="text-xs text-concrete block w-3/4 sm:w-[474px]">
                                Insert wallet addresses that are allowed to manage Station settings
                                and information. Addresses should be comma-separated.
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
