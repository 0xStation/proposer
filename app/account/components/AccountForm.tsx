import { useState, useEffect } from "react"
import { useMutation, useQuery } from "blitz"
import { Field, Form } from "react-final-form"
import updateAccount from "../mutations/updateAccount"
import createAccount from "../mutations/createAccount"
import useStore from "app/core/hooks/useStore"
import getSkills from "app/skills/queries/getSkills"
import { useDropzone } from "react-dropzone"
import Select from "app/core/components/form/Select"
import MultiSelect from "app/core/components/form/MultiSelect"
import { TimezoneOptions, getTimezoneOptionFromValue } from "app/utils/timezoneOptions"
import UploadIcon from "app/core/icons/UploadIcon"
import { Account } from "app/account/types"

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
      <div
        className="w-96 h-52 bg-wet-concrete border border-concrete cursor-pointer relative mt-4"
        {...getRootProps()}
      >
        {coverURL && (
          <img
            alt="Cover picture uploaded by the user."
            src={coverURL}
            className="w-full h-full object-cover object-no-repeat"
          />
        )}
        <span className="absolute bottom-0 right-0 mb-3 mr-3">
          <UploadIcon />
        </span>
        <input {...getInputProps()} />
      </div>
    </div>
  )
}

const PfpInput = ({ pfpURL, onUpload }) => {
  const [uploadingState, setUploadingState] = useState("")

  const uploadFile = async (acceptedFiles) => {
    setUploadingState("UPLOADING")
    const formData = new FormData()
    formData.append("file", acceptedFiles[0])
    let res = await fetch("/api/uploadImage", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    onUpload(data.url)
    setUploadingState("UPLOADED")
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: uploadFile,
    accept: "image/jpeg, image/jpg, image/png",
  })

  return (
    <div className="flex-col">
      <label className="font-bold text-base">PFP</label>
      <div
        className="w-52 h-52 rounded-full bg-wet-concrete border border-concrete flex items-center justify-center cursor-pointer mt-4"
        {...getRootProps()}
      >
        {uploadingState === "UPLOADED" || pfpURL ? (
          <img
            alt="Profile picture uploaded by the user."
            src={pfpURL}
            className="w-full h-full rounded-full"
          />
        ) : (
          <>
            <UploadIcon />
            <input {...getInputProps()} />
          </>
        )}
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
  address: string
  account?: Account
  isEdit: boolean
}) => {
  const [coverURL, setCoverURL] = useState("")
  const [pfpURL, setPfpURL] = useState("")
  const setActiveUser = useStore((state) => state.setActiveUser)

  const [createAccountMutation] = useMutation(createAccount, {
    onSuccess: (data) => {
      onSuccess()
      setActiveUser(data)
    },
    onError: (error) => {
      console.log(error)
    },
  })

  const [updateAccountMutation] = useMutation(updateAccount, {
    onSuccess: (data) => {
      onSuccess()
    },
    onError: (error) => {
      console.log(error)
    },
  })

  useEffect(() => {
    if (account) {
      setPfpURL(account.data.pfpURL || "")
      setCoverURL(account.data.coverURL || "")
    }
  }, [account])

  function capitalizeWord(word: string) {
    return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase()
  }

  function capitalizeSkill(skill: string) {
    return skill
      .split(" ")
      .map((w) => capitalizeWord(w))
      .join(" ")
  }

  const [skills] = useQuery(getSkills, {}, { suspense: false })
  const skillOptions = skills?.map((skill) => {
    return { value: skill.name, label: capitalizeSkill(skill.name) }
  })

  const existingSkills =
    account?.skills.map((skill) => {
      return { value: skill.skill.name, label: skill.skill.name, id: skill.skill.id }
    }) || []

  const existingTimezone = getTimezoneOptionFromValue(account?.data.timezone)

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
              existingSkills,
              timezone: values.timezone.value,
            })
          } else {
            await createAccountMutation({
              ...values,
              address,
              pfpURL,
              coverURL,
              timezone: values.timezone.value,
            })
          }
        } catch (error) {
          console.error(`Error creating account: ${error}`)
          alert("Error applying.")
        }
      }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-y-6 gap-x-2">
            <div className="flex flex-col col-span-2">
              <div className="mt-10 mb-9">
                <h1 className="font-bold text-2xl">Personal Info</h1>
                <p className="mt-3">Populate your profile with your story and your work.</p>
              </div>
              <div className="w-full h-44 flex flex-row justify-between mb-8">
                <PfpInput pfpURL={pfpURL} onUpload={(url) => setPfpURL(url)} />
                <CoverPhotoInput coverURL={coverURL} onUpload={(url) => setCoverURL(url)} />
              </div>
            </div>
            <div className="flex flex-col col-span-2 mt-10">
              <label htmlFor="name" className="text-marble-white text-base font-bold">
                Name
              </label>
              <Field
                component="input"
                name="name"
                placeholder="Name"
                className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
              />
            </div>
            <div className="flex flex-col col-span-2">
              <label htmlFor="bio" className="text-marble-white font-bold">
                Bio
              </label>
              <Field
                component="textarea"
                name="bio"
                placeholder="Tell us about yourself"
                className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
              />
            </div>
            <div className="flex flex-col col-span-2">
              <label htmlFor="contactURL" className="text-marble-white text-base font-bold">
                Contact
              </label>
              <p className="text-concrete text-sm mb-2">What&apos;s the best way to contact you?</p>
              <div className="flex flex-row mt-1">
                <Field
                  component="input"
                  name="contactURL"
                  placeholder="Contact URL (eg: Twitter, Calendly)"
                  className="border border-concrete bg-wet-concrete text-marble-white p-2 flex-1"
                />
              </div>
            </div>
            <div className="flex flex-col col-span-2">
              <label htmlFor="skills" className="text-marble-white text-base font-bold">
                Skills
              </label>
              <p className="text-concrete text-sm mb-2">(Type to add or search skills)</p>
              <div>
                <MultiSelect
                  name="skills"
                  placeholder="Type to add or search skills"
                  options={skillOptions}
                  initialValue={existingSkills}
                />
              </div>
            </div>
            <div className="flex flex-col col-span-2">
              <label htmlFor="timezone" className="text-marble-white mb-2 text-base font-bold">
                Timezone
              </label>
              <Select
                name="timezone"
                placeholder="Select one"
                options={TimezoneOptions}
                initialValue={existingTimezone}
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-magic-mint text-tunnel-black w-1/2 rounded mt-14 mx-auto block p-2"
          >
            {isEdit ? "Save" : "Submit"}
          </button>
        </form>
      )}
    />
  )
}

export default AccountForm
