import { useState, useEffect } from "react"
import { useMutation, invoke } from "blitz"
import { Field, Form } from "react-final-form"
import updateAccount from "../mutations/updateAccount"
import createAccount from "../mutations/createAccount"
import useStore from "app/core/hooks/useStore"
import { useDropzone } from "react-dropzone"
import UploadIcon from "app/core/icons/UploadIcon"
import { Account } from "app/account/types"
import {
  requiredField,
  composeValidators,
  mustBeUnderNumCharacters,
  isValidEmail,
} from "app/utils/validators"
import sendVerificationEmail from "app/email/mutations/sendVerificationEmail"
import Button from "app/core/components/sds/buttons/Button"
import getAccountByAddress from "../queries/getAccountByAddress"
import { useEnsName } from "wagmi"
import truncateString from "app/core/utils/truncateString"

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
        className="w-[5.66rem] h-[5.66rem] border border-wet-concrete rounded-full bg-gradient-to-b object-cover from-electric-violet to-magic-mint flex items-center justify-center cursor-pointer mt-2"
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
  onSuccess,
  account,
  isEdit,
}: {
  onSuccess: () => void
  account?: Account
  isEdit: boolean
}) => {
  const [pfpUrl, setPfpURL] = useState<string | undefined>()
  const [emailVerificationSent, setEmailVerificationSent] = useState<boolean>(false)
  const setActiveUser = useStore((state) => state.setActiveUser)
  const activeUser = useStore((state) => state.activeUser)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { data: ensName } = useEnsName({
    address: account?.address as string,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
  })

  const [createAccountMutation] = useMutation(createAccount, {
    onSuccess: (data) => {
      onSuccess()
      setIsLoading(false)
      setActiveUser(data)
    },
    onError: (error) => {
      console.error(error)
      setIsLoading(false)
    },
  })

  const [updateAccountMutation] = useMutation(updateAccount, {
    onSuccess: async (data) => {
      onSuccess()
      setIsLoading(false)
      // refetch activeUser's account to get updated pfps on pinned workspaces
      const account = await invoke(getAccountByAddress, { address: activeUser?.address })
      setActiveUser(account)
    },
    onError: (error) => {
      setIsLoading(false)
      console.error(error)
    },
  })

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
    <Form
      initialValues={{
        ...Object(account?.data),
        name: account?.data?.name || ensName || truncateString(account?.address || ""),
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
            {/* NAME */}
            <label className="font-bold block">Name</label>
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
            {/* EMAIL
            <label className="font-bold block mt-6">Email</label>
            <p className="text-concrete text-sm">
              Connect and verify your email to receive notifications from Station.
              <a href="https://station-labs.gitbook.io/station-product-manual/for-contributors/getting-started">
                <span className="text-electric-violet"> Learn more</span>
              </a>
            </p>
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
            {/* {meta.error && meta.touched && (
                    <span className=" text-xs text-torch-red mb-2 block">{meta.error}</span>
                  )}
                </div>
              )}
            </Field> */}
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
  )
}

export default WorkspaceSettingsOverviewForm
