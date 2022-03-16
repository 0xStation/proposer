import { useMutation, useRouter, useParam, invoke } from "blitz"
import { Field, Form } from "react-final-form"
import Modal from "../../core/components/Modal"
import createApplication from "../mutations/createApplication"
import useStore from "../../core/hooks/useStore"
import { Initiative } from "../../initiative/types"
import getAccountByAddress from "app/account/queries/getAccountByAddress"

const ApplicationModal = ({
  isOpen,
  setIsOpen,
  initiative,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  initiative: Initiative
}) => {
  const router = useRouter()
  const terminalHandle = useParam("terminalHandle") as string
  const [createApplicationMutation] = useMutation(createApplication, {
    onSuccess: () => {
      router.push(`/terminal/${terminalHandle}/waiting-room?directedFrom=application`)
    },
  })
  const setActiveUserApplications = useStore((state) => state.setActiveUserApplications)
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
      <div className="mt-8">
        <Form
          onSubmit={async (values: { url: string; entryDescription: string }) => {
            try {
              await createApplicationMutation({
                ...values,
                initiativeId: initiative.id,
                accountId: activeUser.id,
              })

              // TODO: this is a less than ideal solution at querying to refresh the `activeUser` state.
              // We need to refresh the state so that the profile page and initiative details page pull
              // in the correct information from the user's account object. This is a temporary solution
              // while I (kristen) figure out how we want to query data from the client.
              let user = await invoke(getAccountByAddress, { address: activeUser.address })
              if (user) {
                setActiveUserApplications(user?.initiatives)
              }
            } catch (error) {
              alert("Error applying.")
            }
          }}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="flex flex-col col-span-2">
                  <label htmlFor="url" className="text-marble-white">
                    URL
                  </label>
                  <Field
                    component="input"
                    name="url"
                    placeholder="Share your best work"
                    className="mt-1 border border-concrete bg-tunnel-black text-marble-white p-2"
                  />
                </div>
                <div className="flex flex-col col-span-2">
                  <label htmlFor="entryDescription" className="text-marble-white">
                    {initiative.data.applicationQuestion || "Why this initiative"}?
                  </label>
                  <Field
                    component="input"
                    name="entryDescription"
                    placeholder="..."
                    className="mt-1 border border-concrete bg-tunnel-black text-marble-white p-2"
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
      </div>
    </Modal>
  )
}

export default ApplicationModal
