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
  rewardText: string[] | string
  contributeText: string[] | string
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
    onError: (error) => {
      console.error(error)
    },
  })

  const parseParagraphs = (text) => {
    if (Array.isArray(text)) {
      return text
    }
    return text.split(",")
  }

  return (
    <Form
      initialValues={initiative?.data || {}}
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
          console.error(`Error creating account: ${error}`)
          alert("Error applying.")
        }
      }}
      render={({ handleSubmit }) => (
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
                Initiative Name
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
                One Liner (short description)
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
                Full Description
              </label>
              <p className="text-concrete text-sm mb-2">Separate paragraphs by comma</p>
              <div className="flex flex-row mt-1">
                <Field
                  component="textarea"
                  name="contributeText"
                  placeholder="Contribute text"
                  className="border border-concrete bg-wet-concrete text-marble-white p-2 flex-1  h-36"
                />
              </div>
            </div>
            <div className="flex flex-col col-span-2">
              <label htmlFor="name" className="text-marble-white text-base font-bold">
                Rewards
              </label>
              <p className="text-concrete text-sm mb-2">Separate rewards by comma</p>
              <Field
                component="input"
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
