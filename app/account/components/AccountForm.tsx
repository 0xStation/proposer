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
    <div
      className="w-full h-[100px] bg-wet-concrete border border-concrete cursor-pointer"
      {...getRootProps()}
    >
      {uploadingState === "UPLOADED" ||
        (coverURL && (
          <img
            alt="Cover picture uploaded by the user."
            src={coverURL}
            className="w-full h-full object-cover object-no-repeat"
          />
        ))}
      <span className="absolute right-2 bottom-2">
        <UploadIcon />
      </span>
      <input {...getInputProps()} />
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
    <div
      className="w-[76px] h-[76px] rounded-full bg-wet-concrete border border-concrete flex items-center justify-center cursor-pointer absolute bottom-[-38px] left-4"
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
          console.log(error)
          alert("Error applying.")
        }
      }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-y-6 gap-x-2">
            <div className="flex flex-col col-span-2">
              <label htmlFor="name" className="text-marble-white mb-2">
                Images
              </label>
              <div className="w-full h-[100px] relative mb-8">
                <CoverPhotoInput coverURL={coverURL} onUpload={(url) => setCoverURL(url)} />
                <PfpInput pfpURL={pfpURL} onUpload={(url) => setPfpURL(url)} />
              </div>
            </div>
            <div className="flex flex-col col-span-2">
              <label htmlFor="name" className="text-marble-white">
                Name
              </label>
              <Field
                component="input"
                name="name"
                placeholder="Satoshi"
                className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
              />
            </div>
            <div className="flex flex-col col-span-2">
              <label htmlFor="bio" className="text-marble-white">
                Bio
              </label>
              <Field
                component="textarea"
                name="bio"
                placeholder="Write about yourself"
                className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
              />
            </div>

            <div className="flex flex-col col-span-2">
              <label htmlFor="contactURL" className="text-marble-white">
                Contact
              </label>
              <span className="text-concrete text-xs mb-2">
                URL of the best way to contact you (twitter profile, discord ID, calendy)
              </span>
              <div className="flex flex-row mt-1">
                <Field
                  component="input"
                  name="contactURL"
                  placeholder="link"
                  className="border border-concrete bg-wet-concrete text-marble-white p-2 flex-1"
                />
              </div>
            </div>

            <div className="flex flex-col col-span-2">
              <label htmlFor="skills" className="text-marble-white">
                Skills
              </label>
              <span className="text-concrete text-xs mb-2">(Type to add additional skills)</span>
              <div>
                <MultiSelect
                  name="skills"
                  placeholder="type to add or search skills"
                  options={skillOptions}
                  initialValue={existingSkills}
                />
              </div>
            </div>

            <div className="flex flex-col col-span-2">
              <label htmlFor="timezone" className="text-marble-white mb-2">
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
            className="bg-magic-mint text-tunnel-black w-1/2 rounded mt-12 mx-auto block p-2"
          >
            Submit
          </button>
        </form>
      )}
    />
  )
}

export default AccountForm
