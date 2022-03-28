import { Field, Form } from "react-final-form"
import { useMutation } from "blitz"
import updateInitiative from "../mutations/updateInitiative"
import { Initiative } from "../types"

// rewardText and contributeText
// have odd type of string[] | string bc of the hacky workaround of using commas to separate paragraphs
// will change soon
interface InitiativeParams {
  bannerURL: string
  name: string
  oneLiner: string
  commitment: string
  rewardText: string
  contributeText: string
  links?: {
    url: string
    symbol: number
  }[]
  skills: string[]
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
  const [updateInitiativeMutation] = useMutation(updateInitiative, {
    onSuccess: (data) => {
      onSuccess()
    },
  })

  const parseParagraphs = (text) => {
    if (Array.isArray(text)) {
      return text
    }
    return text.split("\n")
  }

  const initialFormValues = {
    ...initiative?.data,
    contributeText: initiative?.data?.contributeText?.join("\n"),
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
              contributeText: parseParagraphs(values.contributeText),
              rewardText: parseParagraphs(values.rewardText),
            })
          }
        } catch (error) {
          alert(`${error}`)
        }
      }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-y-6 gap-x-2">
            <div className="flex flex-col col-span-2">
              <label htmlFor="name" className="text-marble-white text-base font-bold">
                Initiative Title*
              </label>
              <Field
                component="input"
                name="initiativeTitle"
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
              <label htmlFor="contactURL" className="text-marble-white text-base font-bold">
                About
              </label>
              <div className="flex flex-row mt-1">
                <Field
                  component="textarea"
                  name="contributeText"
                  placeholder="Contribute text"
                  className="border border-concrete bg-wet-concrete text-marble-white p-2 flex-1 h-36"
                />
              </div>
            </div>
            <div className="flex flex-col col-span-2">
              <label htmlFor="name" className="text-marble-white text-base font-bold">
                Rewards
              </label>
              <Field
                component="textarea"
                name="rewardText"
                placeholder="e.g. NFT, 1000 USDC"
                className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
              />
            </div>
            <div className="flex flex-col col-span-2">
              <label htmlFor="name" className="text-marble-white text-base font-bold">
                Commitment
              </label>
              <Field
                component="input"
                name="commitment"
                placeholder="e.g. full-time"
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
      )}
    />
  )
}

export default InitiativeForm
