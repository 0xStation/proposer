import { useState } from "react"
import { useMutation, useQuery } from "blitz"
import { Field, Form } from "react-final-form"
import Modal from "../../core/components/Modal"
import createAccount from "../mutations/createAccount"
import useStore from "app/core/hooks/useStore"
import getSkills from "app/skills/queries/getSkills"
import { useDropzone } from "react-dropzone"
import CreatableSelect from "react-select/creatable"

interface ApplicationParams {
  handle: string
  discordId: string
  pronouns: string
  timezone: string
  address: string
  skills: {
    label: string
    value: string
  }[]
}

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#2E2E2E",
    color: "#646464",
    borderColor: "#646464",
  }),
  menuList: (provided, state) => ({
    ...provided,
    backgroundColor: "#2E2E2E",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: "#2E2E2E",
    color: "#646464",
    "&:hover": {
      color: "white",
      cursor: "pointer",
    },
  }),
}

const MultiSelectAdapter = ({ input, ...rest }) => (
  <CreatableSelect isMulti {...input} {...rest} styles={customStyles} />
)

const AccountModal = ({
  isOpen,
  setIsOpen,
  address,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  address: string
}) => {
  const [uploadingState, setUploadingState] = useState("")
  const [pfpURL, setPfpURL] = useState("")
  const setActiveUser = useStore((state) => state.setActiveUser)

  const [createAccountMutation] = useMutation(createAccount, {
    onSuccess: (data) => {
      setIsOpen(false)
      console.log(data)
      setActiveUser(data)
    },
    onError: (error) => {
      console.log(error)
    },
  })

  const [skills] = useQuery(getSkills, {}, { suspense: false })
  const skillOptions = skills?.map((skill) => {
    return { value: skill.name, label: skill.name }
  })

  const uploadFile = async (acceptedFiles) => {
    setUploadingState("UPLOADING")
    const formData = new FormData()
    formData.append("file", acceptedFiles[0])
    let res = await fetch("http://localhost:3000/api/uploadImage", {
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: uploadFile })

  return (
    <Modal
      title="Complete your profile"
      subtitle="Complete your profile to continue submitting your interest."
      open={isOpen}
      toggle={setIsOpen}
    >
      <div className="mt-8">
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
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-marble-white">
                    Name
                  </label>
                  <Field
                    component="input"
                    name="name"
                    placeholder="name"
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="handle" className="text-marble-white">
                    Handle
                  </label>
                  <Field
                    component="input"
                    name="handle"
                    placeholder="@handle"
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                </div>
                <div className="flex flex-col col-span-2">
                  <label htmlFor="pfp" className="text-marble-white">
                    PFP
                  </label>
                  {uploadingState === "UPLOADED" ? (
                    <div className="flex flex-row items-center">
                      <img
                        alt="Profile picture uploaded by the user."
                        src={pfpURL}
                        className="w-16 h-16 rounded-full border border-concrete mr-2"
                      />
                      <span
                        className="text-torch-red text-sm cursor-pointer"
                        onClick={() => removeFile()}
                      >
                        Remove
                      </span>
                    </div>
                  ) : uploadingState === "UPLOADING" ? (
                    <p className="text-sm text-marble-white">Upload in progress...</p>
                  ) : (
                    <div
                      {...getRootProps()}
                      className="text-base text-concrete bg-wet-concrete border border-dotted border-concrete p-4 text-center"
                    >
                      <input {...getInputProps()} />
                      {isDragActive ? (
                        <p>Drop your file here ...</p>
                      ) : (
                        <p>
                          Drag and drop a file here, or click to select a file from your device.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col col-span-2">
                  <label htmlFor="skills" className="text-marble-white">
                    Skills
                  </label>
                  <span className="text-concrete text-xs mb-2">
                    (Type to add additional skills)
                  </span>
                  <div>
                    <Field name="skills" component={MultiSelectAdapter} options={skillOptions} />
                  </div>
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
                <div className="flex flex-col">
                  <label htmlFor="pronouns" className="text-marble-white">
                    Pronouns
                  </label>
                  <Field
                    component="input"
                    name="pronouns"
                    placeholder="Enter your pronouns"
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="timezone" className="text-marble-white">
                    Timezone
                  </label>
                  <Field
                    component="select"
                    name="timezone"
                    placeholder="Select one"
                    className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                  >
                    <option />
                    <option value="-12:00">(GMT -12:00) Eniwetok, Kwajalein</option>
                    <option value="-11:00">(GMT -11:00) Midway Island, Samoa</option>
                    <option value="-10:00">(GMT -10:00) Hawaii</option>
                    <option value="-09:50">(GMT -9:30) Taiohae</option>
                    <option value="-09:00">(GMT -9:00) Alaska</option>
                    <option value="-08:00">(GMT -8:00) Pacific Time (US &amp; Canada)</option>
                    <option value="-07:00">(GMT -7:00) Mountain Time (US &amp; Canada)</option>
                    <option value="-06:00">
                      (GMT -6:00) Central Time (US &amp; Canada), Mexico City
                    </option>
                    <option value="-05:00">
                      (GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima
                    </option>
                    <option value="-04:50">(GMT -4:30) Caracas</option>
                    <option value="-04:00">
                      (GMT -4:00) Atlantic Time (Canada), Caracas, La Paz
                    </option>
                    <option value="-03:50">(GMT -3:30) Newfoundland</option>
                    <option value="-03:00">(GMT -3:00) Brazil, Buenos Aires, Georgetown</option>
                    <option value="-02:00">(GMT -2:00) Mid-Atlantic</option>
                    <option value="-01:00">(GMT -1:00) Azores, Cape Verde Islands</option>
                    <option value="+00:00">
                      (GMT) Western Europe Time, London, Lisbon, Casablanca
                    </option>
                    <option value="+01:00">(GMT +1:00) Brussels, Copenhagen, Madrid, Paris</option>
                    <option value="+02:00">(GMT +2:00) Kaliningrad, South Africa</option>
                    <option value="+03:00">
                      (GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg
                    </option>
                    <option value="+03:50">(GMT +3:30) Tehran</option>
                    <option value="+04:00">(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi</option>
                    <option value="+04:50">(GMT +4:30) Kabul</option>
                    <option value="+05:00">
                      (GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent
                    </option>
                    <option value="+05:50">(GMT +5:30) Bombay, Calcutta, Madras, New Delhi</option>
                    <option value="+05:75">(GMT +5:45) Kathmandu, Pokhara</option>
                    <option value="+06:00">(GMT +6:00) Almaty, Dhaka, Colombo</option>
                    <option value="+06:50">(GMT +6:30) Yangon, Mandalay</option>
                    <option value="+07:00">(GMT +7:00) Bangkok, Hanoi, Jakarta</option>
                    <option value="+08:00">(GMT +8:00) Beijing, Perth, Singapore, Hong Kong</option>
                    <option value="+08:75">(GMT +8:45) Eucla</option>
                    <option value="+09:00">
                      (GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk
                    </option>
                    <option value="+09:50">(GMT +9:30) Adelaide, Darwin</option>
                    <option value="+10:00">
                      (GMT +10:00) Eastern Australia, Guam, Vladivostok
                    </option>
                    <option value="+10:50">(GMT +10:30) Lord Howe Island</option>
                    <option value="+11:00">
                      (GMT +11:00) Magadan, Solomon Islands, New Caledonia
                    </option>
                    <option value="+11:50">(GMT +11:30) Norfolk Island</option>
                    <option value="+12:00">
                      (GMT +12:00) Auckland, Wellington, Fiji, Kamchatka
                    </option>
                    <option value="+12:75">(GMT +12:45) Chatham Islands</option>
                    <option value="+13:00">(GMT +13:00) Apia, Nukualofa</option>
                    <option value="+14:00">(GMT +14:00) Line Islands, Tokelau</option>
                  </Field>
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
      </div>
    </Modal>
  )
}

export default AccountModal
