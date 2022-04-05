import { useState } from "react"
import { Field, Form } from "react-final-form"
import { useMutation } from "blitz"
import updateInitiative from "../mutations/updateInitiative"
import MultiSelect from "app/core/components/form/MultiSelect"
import Select from "app/core/components/form/Select"
import RichTextarea from "app/core/components/form/RichTextarea"
import {
  InitiativeStatusOptions,
  getInitiativeStatusOptionFromValue,
} from "app/utils/initiativeStatusOptions"
import { toTitleCase } from "app/core/utils/titleCase"
import { Initiative } from "../types"

interface InitiativeParams {
  bannerURL: string
  name: string
  oneLiner: string
  commitment: string
  rewardText: string
  links?: {
    url: string
    symbol: number
  }[]
  link?: string
  skills: {
    label: string
    value: string
  }[]
  status: {
    label: string
    value: string
  }
  about: any
  isAcceptingApplications: boolean
}

const InitiativeForm = ({
  isEdit,
  onSuccess,
  initiative,
}: {
  onSuccess: () => void
  initiative?: Initiative | null
  isEdit: boolean
}) => {
  const [about, setAbout] = useState(initiative?.data.about)
  const [updateInitiativeMutation] = useMutation(updateInitiative, {
    onSuccess: (data) => {
      onSuccess()
    },
  })

  const skillOptions = initiative?.skills?.map((skill) => {
    return { value: skill.name, label: toTitleCase(skill.name) }
  })

  const existingSkills =
    initiative?.skills.map((skill) => {
      return { value: skill.name, label: skill.name, id: skill.id }
    }) || []

  const existingStatus = getInitiativeStatusOptionFromValue(initiative?.data.status)

  const parseParagraphs = (text) => {
    if (Array.isArray(text)) {
      return text
    }
    return text.split("\n")
  }

  const initialFormValues = {
    ...initiative?.data,
    rewardText: initiative?.data?.rewardText?.join("\n"),
  }

  return (
    <Form
      initialValues={initialFormValues || {}}
      onSubmit={async (values: InitiativeParams) => {
        try {
          if (isEdit) {
            await updateInitiativeMutation({
              ...values,
              id: initiative?.id || 1,
              existingSkills,
              about: about,
              rewardText: parseParagraphs(values.rewardText),
            })
          }
        } catch (error) {
          alert(`${error}`)
        }
      }}
      render={({ handleSubmit }) => (
        <>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-y-6 gap-x-2">
              {/* <div className="flex flex-col col-span-2">
              <div className="mt-10 mb-9">
                <h1 className="font-bold text-2xl">Initiative Info</h1>
                <p className="mt-3">
                  Provide details on your initiative to help prospective applicants learn more.
                </p>
              </div>
            </div> */}
              <div className="flex flex-col col-span-2">
                <label htmlFor="name" className="text-marble-white text-base font-bold">
                  Initiative title*
                </label>
                <Field
                  component="input"
                  name="name"
                  placeholder="Initiative Title"
                  className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                />
              </div>
              <div className="flex flex-col col-span-2">
                <label htmlFor="bio" className="text-marble-white font-bold">
                  One-liner*
                </label>
                <Field
                  component="input"
                  name="oneLiner"
                  placeholder="Tell us about the initiative"
                  className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                />
              </div>
              <div className="flex flex-col col-span-2">
                <label htmlFor="status" className="text-marble-white text-base font-bold mb-1">
                  Initiative Status*
                </label>
                <div>
                  <Select
                    name="status"
                    placeholder="Select one"
                    options={InitiativeStatusOptions}
                    initialValue={existingStatus}
                  />
                </div>
              </div>
              <div className="flex flex-col col-span-2">
                <label htmlFor="description" className="text-marble-white text-base font-bold mb-1">
                  Description
                </label>
                <div>
                  <RichTextarea onChange={setAbout} initialValue={initiative?.data.about} />
                </div>
              </div>
              <div className="flex flex-col col-span-2">
                <label htmlFor="skills" className="text-marble-white text-base font-bold">
                  Skills*
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
                <label htmlFor="link" className="text-marble-white font-bold">
                  Link to more information
                </label>
                <Field
                  component="input"
                  name="link"
                  placeholder="e.g. Notion document, Mirror..."
                  className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
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
        </>
      )}
    />
  )
}

export default InitiativeForm
