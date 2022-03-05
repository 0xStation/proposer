import { useMutation, useRouter, useParam, invoke, useQuery } from "blitz"
import { Field, Form } from "react-final-form"
import Modal from "../../core/components/Modal"
import createApplication from "../mutations/createApplication"
import useStore from "../../core/hooks/useStore"
import { Account } from "../../account/types"
import sendDiscordNotification from "app/application/queries/sendDiscordNotification"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getInitiativeByLocalId from "app/initiative/queries/getInitiativeByLocalId"
import getAccountById from "app/account/queries/getAccountById"

const GetDetailsForDiscord = async (handle, initiativeId, applicantId) => {
  console.log("send notifcation was hit")
  const terminal = await invoke(getTerminalByHandle, { handle })
  const [initiative] = await useQuery(
    getInitiativeByLocalId,
    {
      terminalId: terminal?.id || 0,
      localId: initiativeId,
    },
    { suspense: false }
  )
  const applicant = await invoke(getAccountById, { applicantId })

  initiative &&
    applicant &&
    terminal &&
    sendDiscordNotification(
      handle.toUpperCase(),
      terminal.data.discordWebHook,
      initiative.data.name,
      applicant.data.name
    )
}

const ApplicationModal = ({
  isOpen,
  setIsOpen,
  initiativeId,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  initiativeId: number
}) => {
  const router = useRouter()
  const terminalHandle = useParam("terminalHandle") as string
  const [createApplicationMutation] = useMutation(createApplication, {
    onSuccess: () => {
      router.push(`/terminal/${terminalHandle}/waiting-room?directedFrom=application`)
    },
  })

  const activeUser: Account | null = useStore((state) => state.activeUser)

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
  function sendNotification() {
    GetDetailsForDiscord(terminalHandle, initiativeId, activeUser?.id)
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
                initiativeId: initiativeId,
                accountId: activeUser.id,
              })
              sendNotification()
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
                    Why this initiative?
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
