import { useState, useEffect } from "react"
import { useMutation, useQuery, Image } from "blitz"
import { Field, Form } from "react-final-form"
import updateAccount from "../mutations/updateAccount"
import createAccount from "../mutations/createAccount"
import useStore from "app/core/hooks/useStore"
import { useDropzone } from "react-dropzone"
import UploadIcon from "app/core/icons/UploadIcon"
import { Account } from "app/account/types"
import PersonalSiteIcon from "public/personal-site-icon.svg"
import TwitterIcon from "public/twitter-icon.svg"
import GithubIcon from "public/github-icon.svg"
import TikTokIcon from "public/tiktok-icon.svg"
import InstagramIcon from "public/instagram-icon.svg"
import {
  mustBeUrl,
  requiredField,
  composeValidators,
  mustBeUnderNumCharacters,
} from "app/utils/validators"

interface ApplicationParams {
  name: string
  bio: string
  contactURL: string
  pronouns?: string
  timezone: { label: string; value: string }
  address: string
  skills: {
    label: string
    value: string
  }[]
}

const CoverPhotoInput = ({ coverURL, onUpload }) => {
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
      <label className="font-bold text-base">Cover</label>
      <p className="text-concrete text-sm">.jpg or .png, 1200px x 600px recommended</p>
      <div
        className="w-[18rem] h-[9rem] bg-gradient-to-b object-cover from-electric-violet to-magic-mint border border-concrete cursor-pointer relative mt-2"
        {...getRootProps()}
      >
        {coverURL && (
          <img
            alt="Cover picture uploaded by the user."
            src={coverURL}
            className="w-full h-full object-cover object-no-repeat"
          />
        )}
        <div className="absolute bottom-0 right-0 mb-1 mr-1 h-5 w-5 z-10">
          <UploadIcon />
        </div>
        <div className="absolute bottom-0 right-0 mb-2 mr-[.55rem] h-5 w-5 rounded-full bg-tunnel-black opacity-50">
          <span className=" h-full w-full"></span>
        </div>
        <input {...getInputProps()} />
      </div>
    </div>
  )
}

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
      <p className="text-concrete text-sm">.jpg or .png, 600px x 600px recommended</p>
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

const AccountForm = ({
  onSuccess,
  address,
  account,
  isEdit,
}: {
  onSuccess: () => void
  address?: string
  account?: Account
  isEdit: boolean
}) => {
  const [coverURL, setCoverURL] = useState<string | undefined>()
  const [pfpURL, setPfpURL] = useState<string | undefined>()
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

  useEffect(() => {
    // initialize pfpInput and coverInput with user's pre-existing images
    setPfpURL(account?.data?.pfpURL)
    setCoverURL(account?.data?.coverURL)
  }, [account?.data?.pfpURL, account?.data?.coverURL])

  return (
    <Form
      initialValues={account?.data || {}}
      onSubmit={async (values: ApplicationParams) => {
        try {
          if (isEdit) {
            await updateAccountMutation({
              ...values,
              address,
              pfpURL,
              coverURL,
            })
          } else {
            await createAccountMutation({
              ...values,
              address,
              pfpURL,
              coverURL,
              createSession: true,
            })
          }
        } catch (error) {
          console.error(`Error creating account: ${error}`)
          alert("Error applying.")
        }
      }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div>
            <div className="flex flex-col">
              <label htmlFor="name" className="text-marble-white text-base font-bold">
                Name*
              </label>
              <p className="text-concrete text-sm">50 characters max</p>
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
            </div>
            <div className="flex flex-col mt-6">
              <label htmlFor="bio" className="text-marble-white font-bold">
                About
              </label>
              <p className="text-concrete text-sm">150 characters max</p>
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
            </div>
            <div className="flex flex-col mt-6">
              <PfpInput pfpURL={pfpURL} onUpload={(url) => setPfpURL(url)} />
            </div>
            <div className="flex flex-col mt-6">
              <CoverPhotoInput coverURL={coverURL} onUpload={(url) => setCoverURL(url)} />
            </div>
            <div className="flex flex-col mt-6">
              <label className="mb-2 font-bold text-base">Socials</label>
              <Field name="contactURL" validate={mustBeUrl}>
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
                      placeholder="e.g. https://mirror.xyz/mima"
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
                      <Image src={TwitterIcon} alt="Twitter Icon." width={14} height={14} />
                    </div>
                    <input
                      {...input}
                      type="text"
                      placeholder="e.g. https://twitter.com/mima"
                      className="h-full inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                    />
                    {/* this error shows up when the user focuses the field (meta.touched) */}
                    {meta.error && meta.touched && (
                      <span className="text-xs text-torch-red mb-2 block">{meta.error}</span>
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
                      placeholder="e.g. https://github.com/mima"
                      className="h-full inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                    />
                    {/* this error shows up when the user focuses the field (meta.touched) */}
                    {meta.error && meta.touched && (
                      <span className=" text-xs text-torch-red mb-2 block">{meta.error}</span>
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
                      placeholder="e.g. https://tiktok.com/mima"
                      className="h-full inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                    />
                    {/* this error shows up when the user focuses the field (meta.touched) */}
                    {meta.error && meta.touched && (
                      <span className=" text-xs text-torch-red mb-2 block">{meta.error}</span>
                    )}
                  </div>
                )}
              </Field>
              <Field name="instagramUrl" validate={mustBeUrl}>
                {({ input, meta }) => (
                  <div className="h-10 w-full border border-concrete bg-wet-concrete text-marble-white mb-5 rounded">
                    <div className="py-2 px-3 mx-1 w-[2%] inline border-r border-concrete h-full">
                      <Image src={InstagramIcon} alt="Instagram Icon." width={14} height={14} />
                    </div>
                    <input
                      {...input}
                      type="text"
                      placeholder="e.g. https://instagram.com/mima"
                      className="h-full inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                    />
                    {/* this error shows up when the user focuses the field (meta.touched) */}
                    {meta.error && meta.touched && (
                      <span className=" text-xs text-torch-red mb-2 block">{meta.error}</span>
                    )}
                  </div>
                )}
              </Field>
            </div>
          </div>
          <button
            type="submit"
            className="bg-magic-mint text-tunnel-black w-48 rounded mt-14 mb-40 block p-2 hover:opacity-70"
          >
            {isEdit ? "Save" : "Next"}
          </button>
        </form>
      )}
    />
  )
}

export default AccountForm
