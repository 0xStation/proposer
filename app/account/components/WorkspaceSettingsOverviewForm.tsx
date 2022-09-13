import { useState, useEffect } from "react"
import { useMutation, Image } from "blitz"
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
      <label className="font-bold">Profile picture or logo</label>
      <p className="text-concrete text-sm">.jpg or .png, 600 x 600px recommended.</p>
      <div
        className="w-[5.66rem] h-[5.66rem] border border-wet-concrete rounded-full bg-gradient-to-b object-cover from-electric-violet to-magic-mint flex items-center justify-center cursor-pointer mt-2"
        {...getRootProps()}
      >
        <>
          {pfpURL && (
            <img
              alt="Profile picture uploaded by the user."
              src={pfpURL}
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
  const [pfpURL, setPfpURL] = useState<string | undefined>()
  const [emailVerificationSent, setEmailVerificationSent] = useState<boolean>(false)
  const setActiveUser = useStore((state) => state.setActiveUser)

  const [createAccountMutation] = useMutation(createAccount, {
    onSuccess: (data) => {
      onSuccess()
      setActiveUser(data)
    },
    onError: (error) => {
      console.error(error)
    },
  })

  const [updateAccountMutation] = useMutation(updateAccount, {
    onSuccess: (data) => {
      onSuccess()
      setActiveUser(data)
    },
    onError: (error) => {
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
    setPfpURL(account?.data?.pfpURL)
  }, [account?.data?.pfpURL])

  return (
    <Form
      initialValues={account?.data || {}}
      onSubmit={async (values) => {
        try {
          const parameters = {
            address: account?.address!,
            name: values.name,
            bio: values.about,
            pfpURL,
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
        }
      }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div className="max-w-lg mr-5 sm:mr-0">
            {/* NAME */}
            <label className="font-bold block">Name*</label>
            <p className="text-concrete text-sm">50 character max.</p>
            <Field
              component="input"
              name="name"
              placeholder="Name"
              validate={composeValidators(requiredField, mustBeUnderNumCharacters(50))}
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
            <Field component="textarea" name="about" validate={mustBeUnderNumCharacters(150)}>
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
              <PfpInput pfpURL={pfpURL} onUpload={(url) => setPfpURL(url)} />
            </div>
            {/* EMAIL */}
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
                  {meta.error && meta.touched && (
                    <span className=" text-xs text-torch-red mb-2 block">{meta.error}</span>
                  )}
                </div>
              )}
            </Field>
          </div>
          <Button className="mt-12" isSubmitType={true}>
            {isEdit ? "Save" : "Next"}
          </Button>
        </form>
      )}
    />
  )
}

export default WorkspaceSettingsOverviewForm