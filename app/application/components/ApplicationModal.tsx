import { useMutation, useRouter, useParam, invoke, useQuery } from "blitz"
import { Field, Form } from "react-final-form"
import Modal from "../../core/components/Modal"
import createApplication from "../mutations/createApplication"
import useStore from "../../core/hooks/useStore"
import { Account } from "../../account/types"
import getTerminalById from "app/terminal/queries/getTerminalById"
import getInitiativeByLocalId from "app/initiative/queries/getInitiativeByLocalId"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import { Initiative } from "../../initiative/types"

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

  const activeUser: Account | null = useStore((state) => state.activeUser)

  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const terminalId = terminal?.id || 0
  // const [initiative] = useQuery(getInitiativeByLocalId, {
  //   terminalId: terminalId,
  //   localId: initiativeId,
  // })

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

  const webhook = terminal?.data.discordWebHook

  async function sendDiscordNotification(handle, hook) {
    const title = `${activeUser?.data.name} just submitted an application to ${initiative.data.name}!`
    const description = `https://station.express/terminal/${terminalHandle}/waiting-room`
    const notification = {
      content: `New Application Submitted to ${handle.toUpperCase()}`,
      embeds: [
        {
          title: title,
          description: description,
        },
      ],
    }
    const url = hook
    await fetch(url, {
      method: "POST",
      body: JSON.stringify(notification),
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  async function queNotification() {
    if (webhook) {
      await sendDiscordNotification(terminalHandle, webhook)
    }
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
            } catch (error) {
              alert("Error applying.")
            }
            queNotification()
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
