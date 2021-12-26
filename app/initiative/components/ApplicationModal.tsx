import { Field, Form } from "react-final-form"
import Modal from "../../core/components/Modal"

const ApplicationModal = ({ isOpen, setIsOpen }) => {
  return (
    <Modal
      title="Contribute"
      subtitle="Submit your interest in contributing to the initiative. "
      open={isOpen}
      toggle={setIsOpen}
    >
      <div className="mt-8">
        <Form
          onSubmit={() => {
            alert("sumbitting")
          }}
          render={({ handleSubmit }) => (
            <form>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="flex flex-col">
                  <label htmlFor="firstName" className="text-marble-white">
                    First Name
                  </label>
                  <Field
                    name="firstName"
                    component="input"
                    placeholder="First Name"
                    className="mt-1 border border-concrete bg-tunnel-black text-marble-white p-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="pronouns" className="text-marble-white">
                    Pronouns
                  </label>
                  <Field
                    component="input"
                    name="pronouns"
                    placeholder="pronouns"
                    className="mt-1 border border-concrete bg-tunnel-black text-marble-white p-2"
                  />
                </div>

                <div className="flex flex-col col-span-2">
                  <label htmlFor="url" className="text-marble-white">
                    URL
                  </label>
                  <Field
                    component="input"
                    name="url"
                    placeholder="something.com"
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
