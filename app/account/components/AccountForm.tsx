import { useState } from "react"
import { useMutation, useQuery } from "blitz"
import { Field, Form } from "react-final-form"
import createAccount from "../mutations/createAccount"
import useStore from "app/core/hooks/useStore"
import getSkills from "app/skills/queries/getSkills"
import { useDropzone } from "react-dropzone"
import Select from "app/core/components/form/Select"
import MultiSelect from "app/core/components/form/MultiSelect"
import TimezoneOptions from "app/utils/timezoneOptions"
import UploadIcon from "app/core/icons/UploadIcon"

interface ApplicationParams {
  name: string
  discordId: string
  pronouns?: string
  timezone: string
  address: string
  skills: {
    label: string
    value: string
  }[]
}

const CoverPhotoInput = () => {
  const [uploadingState, setUploadingState] = useState("")
  const [coverURL, setCoverURL] = useState("")

  const uploadFile = async (acceptedFiles) => {
    setUploadingState("UPLOADING")
    const formData = new FormData()
    formData.append("file", acceptedFiles[0])
    let res = await fetch("/api/uploadImage", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    setCoverURL(data.url)
    setUploadingState("UPLOADED")
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: uploadFile,
    accept: "image/jpeg, image/jpg, image/png",
  })

  return (
    <div className="w-full h-[100px] bg-wet-concrete border border-concrete" {...getRootProps()}>
      <img
        alt="Profile picture uploaded by the user."
        src={coverURL}
        className="w-full h-full object-cover object-no-repeat"
      />
      <span className="absolute right-2 bottom-2">
        <UploadIcon />
      </span>
      <input {...getInputProps()} />
    </div>
  )
}

const PfpInput = () => {
  const [uploadingState, setUploadingState] = useState("")
  const [pfpURL, setPfpURL] = useState("")

  const uploadFile = async (acceptedFiles) => {
    setUploadingState("UPLOADING")
    const formData = new FormData()
    formData.append("file", acceptedFiles[0])
    let res = await fetch("/api/uploadImage", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    setPfpURL(data.url)
    setUploadingState("UPLOADED")
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: uploadFile,
    accept: "image/jpeg, image/jpg, image/png",
  })

  return (
    <div
      className="w-[76px] h-[76px] rounded-full bg-wet-concrete border border-concrete flex items-center justify-center cursor-pointer absolute bottom-[-38px] left-4"
      {...getRootProps()}
    >
      {uploadingState === "UPLOADED" ? (
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

const AccountForm = ({ onSuccess, address }: { onSuccess: () => void; address: string }) => {
  const [uploadingState, setUploadingState] = useState("")
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

  const uploadFile = async (acceptedFiles) => {
    setUploadingState("UPLOADING")
    const formData = new FormData()
    formData.append("file", acceptedFiles[0])
    let res = await fetch("/api/uploadImage", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    setPfpURL(data.url)
    setUploadingState("UPLOADED")
  }

  const removeFile = () => {
    setUploadingState("")
    setPfpURL("")
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: uploadFile,
    accept: "image/jpeg, image/jpg, image/png",
  })

  return (
    <Form
      onSubmit={async (values: ApplicationParams) => {
        try {
          await createAccountMutation({ ...values, address, pfpURL })
        } catch (error) {
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
                <CoverPhotoInput />
                <PfpInput />
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
              <label htmlFor="discordId" className="text-marble-white">
                Discord ID
              </label>
              <Field
                component="input"
                name="discordId"
                placeholder="Discord ID"
                className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
              />
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
                />
              </div>
            </div>

            <div className="flex flex-col col-span-2">
              <label htmlFor="timezone" className="text-marble-white mb-2">
                Timezone
              </label>
              <Select name="timezone" placeholder="Select one" options={TimezoneOptions} />
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
