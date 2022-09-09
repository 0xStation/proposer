import Modal from "./sds/overlays/Modal"
import Select from "./form/Select"
import Button from "./sds/buttons/Button"
import { Form } from "react-final-form"

export const NewWorkspaceModal = ({ isOpen, setIsOpen }) => {
  return (
    <Modal
      open={isOpen}
      toggle={() => {
        setIsOpen(!isOpen)
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">New workspace</h1>
        <p className="text-base mt-6">
          Select a multi-sig address that you would like to govern the workspace. The admins of the
          selected multi-sig will be the default admins of the workspace.
        </p>
        <Form
          initialValues={{}}
          onSubmit={() => console.log("submit")}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <label className="font-bold block mt-6">Multi-sig address*</label>
              <span className="text-xs text-light-concrete block mb-2">
                Options displayed are the multi-sig addresses that you’re a current admin of and
                doesn’t govern any existing workspace.
              </span>
              <Select name="workspace" options={[]} placeholder="Select one" />
              <div className="mt-6 flex justify-end">
                <div className="flex flex-col">
                  <Button isSubmitType={true} isDisabled={true} className="block self-end">
                    Create
                  </Button>
                  <span className="text-xs mt-2">
                    You can continue once you've selected an option.
                  </span>
                </div>
              </div>
            </form>
          )}
        />
      </div>
    </Modal>
  )
}

export default NewWorkspaceModal
