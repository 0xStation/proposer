import { Formik, Field, Form, FormikHelpers } from "formik"
import Modal from "../../core/components/Modal"

interface Values {
  firstName: string
  pronouns: string
  url: string
}

const ApplicationModal = ({ isOpen, setIsOpen }) => {
  return (
    <Modal
      title="Contribute"
      subtitle="Submit your interest in contributing to the initiative. "
      open={isOpen}
      toggle={setIsOpen}
    >
      <div className="mt-8">
        <Formik
          initialValues={{
            firstName: "",
            pronouns: "",
            url: "",
          }}
          onSubmit={(values: Values, { setSubmitting }: FormikHelpers<Values>) => {
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2))
              setSubmitting(false)
            }, 500)
          }}
        >
          <Form>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div className="flex flex-col">
                <label htmlFor="firstName" className="text-marble-white">
                  First Name
                </label>
                <Field
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  className="mt-1 border border-concrete bg-tunnel-black text-marble-white p-2"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="pronouns" className="text-marble-white">
                  Pronouns
                </label>
                <Field
                  id="pronouns"
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
                  id="url"
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
          </Form>
        </Formik>
      </div>
    </Modal>
  )
}

export default ApplicationModal
