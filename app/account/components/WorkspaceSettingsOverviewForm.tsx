import { useState, useEffect } from "react"
import { useMutation, invoke, invalidateQuery, useQuery, useParam, Image } from "blitz"
import { Field, Form } from "react-final-form"
import DiscordIcon from "/public/discord-icon.svg"
import updateAccount from "../mutations/updateAccount"
import createAccount from "../mutations/createAccount"
import useStore from "app/core/hooks/useStore"
import { useDropzone } from "react-dropzone"
import UploadIcon from "app/core/icons/UploadIcon"
import { Account, AccountMetadata } from "app/account/types"
import {
  requiredField,
  composeValidators,
  mustBeUnderNumCharacters,
  isValidEmail,
} from "app/utils/validators"
import sendVerificationEmail from "app/email/mutations/sendVerificationEmail"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import getAccountByAddress from "../queries/getAccountByAddress"
import { useEnsName } from "wagmi"
import truncateString from "app/core/utils/truncateString"
import getAccountEmail from "../queries/getAccountEmail"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import ConnectDiscordModal from "app/core/components/ConnectDiscordModal"

const PfpInput = ({ pfpUrl, onUpload }) => {
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
      <label className="font-bold">Profile picture or logo</label>
      <p className="text-concrete text-sm">.jpg or .png, 600 x 600px recommended.</p>
      <div
        className="relative w-[5.66rem] h-[5.66rem] border border-wet-concrete rounded-full bg-gradient-to-b object-cover from-electric-violet to-magic-mint flex items-center justify-center cursor-pointer mt-2"
        {...getRootProps()}
      >
        <>
          {pfpUrl && (
            <img
              alt="Profile picture uploaded by the user."
              src={pfpUrl}
              className="w-full h-full rounded-full"
            />
          )}
          <span className="absolute z-10">
            <UploadIcon />
          </span>
          <div className="rounded-full bg-tunnel-black opacity-50 h-5 w-5 absolute" />
          <input {...getInputProps()} />
        </>
      </div>
    </div>
  )
}

const WorkspaceSettingsOverviewForm = ({
  account,
  isEdit,
}: {
  account?: Account
  isEdit: boolean
}) => {
  const setToastState = useStore((state) => state.setToastState)
  const [pfpUrl, setPfpURL] = useState<string | undefined>()
  const [emailVerificationSent, setEmailVerificationSent] = useState<boolean>(false)
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState<boolean>(false)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const activeUser = useStore((state) => state.activeUser)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const accountAddress = useParam("accountAddress", "string") as string

  const { data: ensName } = useEnsName({
    address: account?.address as string,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
  })

  const [createAccountMutation] = useMutation(createAccount, {
    onSuccess: (data) => {
      setActiveUser(data)
      invalidateQuery(getAccountByAddress)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Workspace successfully updated",
      })
      setIsLoading(false)
    },
    onError: (error) => {
      console.error(error)
      setIsLoading(false)
    },
  })

  const [updateAccountMutation] = useMutation(updateAccount, {
    onSuccess: async (data) => {
      // refetch activeUser's account to get updated pfps on pinned workspaces
      const account = await invoke(getAccountByAddress, { address: activeUser?.address })
      setActiveUser(account) // refresh active user for side navigation pfps updates
      invalidateQuery(getAccountByAddress) // refresh workspace account for metadata updates
      invalidateQuery(getAccountEmail) // refresh email for settings form
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Workspace successfully updated",
      })
      setIsLoading(false)
    },
    onError: (error) => {
      setIsLoading(false)
      console.error(error)
    },
  })

  const [accountEmail, { isLoading: isAccountEmailLoading }] = useQuery(
    getAccountEmail,
    { address: toChecksumAddress(accountAddress) },
    {
      enabled: !!accountAddress,
      suspense: false,
      refetchOnWindowFocus: false,
    }
  )

  const [sendVerificationEmailMutation] = useMutation(sendVerificationEmail, {
    onError: (error) => {
      console.error(error)
    },
  })

  useEffect(() => {
    // initialize pfpInput with user's pre-existing images
    setPfpURL(account?.data?.pfpUrl)
  }, [account?.data?.pfpUrl])

  return (
    <>
      {!account?.discordId && (
        <ConnectDiscordModal isOpen={isDiscordModalOpen} setIsOpen={setIsDiscordModalOpen} />
      )}
      <Form
        initialValues={{
          ...Object(account?.data),
          name: account?.data?.name || ensName || truncateString(account?.address || ""),
          email: accountEmail,
        }}
        onSubmit={async (values) => {
          setIsLoading(true)
          try {
            const parameters = {
              address: account?.address!,
              name: values.name,
              bio: values.bio,
              pfpUrl,
              email: values.email,
            }
            if (isEdit) {
              await updateAccountMutation({
                ...parameters,
              })
            } else {
              await createAccountMutation({
                ...parameters,
                createSession: true,
              })
            }
          } catch (error) {
            console.error(`Error updating account: ${error}`)
            alert("Error saving information.")
            setIsLoading(false)
          }
        }}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <div className="max-w-lg mr-5 sm:mr-0">
              {/* DISPLAY NAME */}
              <label className="font-bold block">Display name</label>
              <p className="text-concrete text-sm">50 character max.</p>
              <Field
                component="input"
                name="name"
                placeholder="Name"
                validate={composeValidators(mustBeUnderNumCharacters(50))}
              >
                {({ input, meta }) => (
                  <div>
                    <input
                      {...input}
                      type="text"
                      placeholder="Name"
                      className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2 rounded w-full"
                    />
                    {/* this error shows up when the user focuses the field (meta.touched) */}
                    {meta.error && meta.touched && (
                      <span className=" text-xs text-torch-red mb-2 block">{meta.error}</span>
                    )}
                  </div>
                )}
              </Field>
              {/* ABOUT */}
              <label className="font-bold block mt-6">About</label>
              <p className="text-concrete text-sm">150 characters max.</p>
              <Field component="textarea" name="bio" validate={mustBeUnderNumCharacters(150)}>
                {({ input, meta }) => (
                  <div>
                    <textarea
                      {...input}
                      placeholder="Tell us about yourself"
                      className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2 rounded min-h-[112px] w-full"
                    />
                    {/* this error shows up when the user focuses the field (meta.touched) */}
                    {meta.error && meta.touched && (
                      <span className=" text-xs text-torch-red block">{meta.error}</span>
                    )}
                  </div>
                )}
              </Field>
              {/* PFP */}
              <div className="flex flex-col mt-6">
                <PfpInput pfpUrl={pfpUrl} onUpload={(url) => setPfpURL(url)} />
              </div>
              {/* EMAIL */}
              <label className="font-bold block mt-6">Email</label>
              <p className="text-concrete text-sm">
                Connect and verify your email to receive notifications from Station.
                <a href="https://station-labs.gitbook.io/station-product-manual/for-contributors/getting-started">
                  <span className="text-electric-violet"> Learn more</span>
                </a>
              </p>
              {isAccountEmailLoading ? (
                <div className="flex flex-row w-full my-1 rounded-lg bg-wet-concrete shadow border-solid h-[38px] motion-safe:animate-pulse" />
              ) : (
                <Field component="input" name="email" validate={isValidEmail}>
                  {({ input, meta }) => (
                    <div>
                      <input
                        {...input}
                        type="text"
                        placeholder="e.g. member@dao.xyz"
                        className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2 rounded w-full"
                      />
                      {account?.data.hasSavedEmail && !account?.data.hasVerifiedEmail && (
                        <p className="text-concrete text-xs pt-1">
                          Check your inbox to verify your email. Don&apos;t see an email from us?{" "}
                          <button
                            className="text-electric-violet font-bold"
                            disabled={emailVerificationSent}
                            onClick={async (e) => {
                              e.preventDefault()
                              setEmailVerificationSent(true)
                              await sendVerificationEmailMutation({
                                accountId: account?.id as number,
                              })
                            }}
                          >
                            {!emailVerificationSent ? "Resend" : "Sent!"}
                          </button>
                        </p>
                      )}
                      {/* this error shows up when the user focuses the field (meta.touched) */}
                      {meta.error && meta.touched && (
                        <span className=" text-xs text-torch-red mb-2 block">{meta.error}</span>
                      )}
                    </div>
                  )}
                </Field>
              )}
            </div>
            <div className="mt-7">
              <label className="font-bold block">Discord</label>
              <p className="text-concrete text-sm">
                Provide your Discord handle so individuals on your proposal have a way to contact
                you.
              </p>
              {account?.discordId ? (
                <button
                  disabled
                  className="mt-3 border border-marble-white text-marble-white rounded flex flex-row py-2 px-3 opacity-70 cursor-not-allowed"
                >
                  <Image src={DiscordIcon} alt="Discord icon" width={20} height={20} />
                  <p className="pl-2">Connected to Discord</p>
                </button>
              ) : (
                <button
                  type="button"
                  className="mt-3 border border-marble-white text-marble-white rounded flex flex-row py-2 px-3 hover:bg-wet-concrete"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsDiscordModalOpen(true)
                  }}
                >
                  <Image src={DiscordIcon} alt="Discord icon" width={20} height={20} />
                  <p className="pl-2">Connect Discord</p>
                </button>
              )}
            </div>
            <Button
              className="mt-12"
              isSubmitType={true}
              isLoading={isLoading}
              isDisabled={isLoading}
            >
              {isEdit ? "Save" : "Next"}
            </Button>
          </form>
        )}
      />
    </>
  )
}

export default WorkspaceSettingsOverviewForm
