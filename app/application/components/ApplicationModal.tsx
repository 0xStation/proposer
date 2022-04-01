import { useState } from "react"
import { useMutation, useRouter, useParam, invoke } from "blitz"
import { Field, Form } from "react-final-form"
import Modal from "../../core/components/Modal"
import createApplication from "../mutations/createApplication"
import useStore from "../../core/hooks/useStore"
import { Initiative } from "../../initiative/types"
import { QUERY_PARAMETERS } from "app/core/utils/constants"
import Button from "app/core/components/Button"

export const ApplicationConfirmationModal = ({
  confirmationOpen,
  setIsConfirmationOpen,
  urlField,
  entryDescription,
  onClick,
}) => {
  return (
    <Modal
      title="Confirm your submission"
      open={confirmationOpen}
      toggle={(close) => setIsConfirmationOpen(false)}
    >
      <p className="text-center py-10 px-5">
        You won&apos;t be able to edit your submission until the first day of next month. Would you
        like to send in your submission now?
      </p>
      <Button className="px-5" onClick={() => onClick({ url: urlField, entryDescription })}>
        Confirm
      </Button>
    </Modal>
  )
}

const ApplicationModal = ({
  isOpen,
  setIsOpen,
  initiative,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  initiative: Initiative
}) => {
  const [urlField, setUrlField] = useState<string>("")
  const [entryDescriptionField, setEntryDescriptionField] = useState<string>("")
  const [confirmationOpen, setIsConfirmationOpen] = useState<boolean>(false)
  const { DIRECTED_FROM } = QUERY_PARAMETERS
  const router = useRouter()
  const terminalHandle = useParam("terminalHandle") as string
  const [createApplicationMutation] = useMutation(createApplication, {
    onSuccess: () => {
      setIsOpen(false)
      router.push(
        `/terminal/${terminalHandle}/waiting-room?directedFrom=${DIRECTED_FROM.SUBMITTED_APPLICATION}`
      )
    },
  })
  const activeUser = useStore((state) => state.activeUser)

  if (!activeUser) {
    return (
      <Modal
        title="Oops!"
        subtitle="You must be logged in."
        open={isOpen}
        toggle={setIsOpen}
        showTitle={true}
      />
    )
  }

  return (
    <Modal
      title="Contribute"
      subtitle="Submit your interest in contributing to the initiative."
      open={isOpen}
      toggle={setIsOpen}
    >
      <ApplicationConfirmationModal
        confirmationOpen={confirmationOpen}
        setIsConfirmationOpen={setIsConfirmationOpen}
        urlField={urlField}
        entryDescription={entryDescriptionField}
        onClick={async (values) => {
          try {
            await createApplicationMutation({
              ...values,
              initiativeId: initiative.id,
              accountId: activeUser.id,
            })
          } catch (error) {
            alert("Error applying.")
          }
        }}
      />
      <div className="mt-8 mx-2">
        <Form
          onSubmit={async (values: { url: string; entryDescription: string }) => {
            const { url, entryDescription } = values
            setUrlField(url)
            setEntryDescriptionField(entryDescription)
            setIsConfirmationOpen(true)
          }}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="flex flex-col col-span-2">
                  <label htmlFor="url" className="text-marble-white">
                    Share a link to a proposal or a project you&apos;re proud of*
                  </label>
                  <Field
                    component="input"
                    name="url"
                    placeholder="Share your best work"
                    className="mt-1 border border-concrete bg-tunnel-black text-marble-white p-2"
                  />
                </div>
                <div className="flex flex-col col-span-2 mt-4">
                  <label htmlFor="entryDescription" className="text-marble-white">
                    {initiative.data.applicationQuestion ||
                      `What unique value are you looking to bring to ${
                        initiative.data.name || "this initiative"
                      }`}
                    *
                  </label>
                  <Field
                    component="textarea"
                    name="entryDescription"
                    placeholder="Highlight your unique value in 3-5 sentences"
                    className="mt-1 border border-concrete bg-tunnel-black text-marble-white p-2"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-magic-mint text-tunnel-black w-1/2 rounded mt-12 mx-auto block p-2 hover:opacity-70"
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

export default ApplicationModal
