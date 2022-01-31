import { useMutation, useRouter, useParam, useQuery } from "blitz"
import { Field, Form } from "react-final-form"
import Modal from "../../core/components/Modal"
import createApplication from "../mutations/createApplication"
import useStore from "../../core/hooks/useStore"
import { Account } from "../../account/types"
import Staff from "/public/role-staff.svg"
import Commuter from "/public/role-commuter.svg"
import Visitor from "/public/role-visitor.svg"

function roleSVG(role) {
  let svg
  if (role === "STAFF") {
    svg = Staff
  } else if (role === "COMMUTER") {
    svg = Commuter
  } else if (role === "VISITOR") {
    svg = Visitor
  } else {
    svg = "N/A"
  }
  return svg
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
  const terminalId = useParam("terminalId", "number") || 1
  const [createApplicationMutation] = useMutation(createApplication, {
    onSuccess: () => {
      router.push(`/terminal/${terminalId}/waiting`)
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
                applicantId: activeUser.id,
              })
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
                  <label htmlFor="why" className="text-marble-white">
                    Why this initiative?
                  </label>
                  <Field
                    component="input"
                    name="why"
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
