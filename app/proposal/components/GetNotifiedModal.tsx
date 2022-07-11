import { useEffect } from "react"
import { Field, Form } from "react-final-form"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import { useMutation } from "blitz"
import addEmailToAccount from "app/account/mutations/addEmailToAccount"
import { composeValidators, requiredField, isValidEmail } from "app/utils/validators"

const GetNotifiedModal = ({ isOpen, setIsOpen }) => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)

  const [addEmailMutation] = useMutation(addEmailToAccount, {
    onSuccess: async () => {
      setIsOpen(false)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "You'll now receive updates about your proposals.",
      })
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  useEffect(() => {
    // close modal if user has already saved an email
    if (!!activeUser?.data.hasSavedEmail) {
      setIsOpen(false)
    }
  }, [activeUser])

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Get notified when proposal status changes</h3>
        <p className="mt-2">
          Only reviewers of your proposal can contact you via email. Your email won&apos;t be
          displayed or shared with anyone.
          <a href="https://station.express">
            <span className="text-electric-violet font-bold"> Learn more</span>
          </a>
        </p>
        <Form
          onSubmit={async (values) => {
            if (activeUser) {
              addEmailMutation({ accountId: activeUser.id, email: values.email })
            }
          }}
          render={({ form, handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
                <Field name="email" validate={composeValidators(requiredField, isValidEmail)}>
                  {({ meta, input }) => (
                    <>
                      <label className="font-bold block mt-6">Email</label>
                      <input
                        {...input}
                        type="text"
                        placeholder="e.g. member@dao.xyz"
                        className="bg-wet-concrete border border-concrete rounded mt-1 w-full p-2"
                      />
                      {((meta.touched && input.value === "") || meta.error) && (
                        <span className="text-torch-red text-xs">Invalid email.</span>
                      )}
                    </>
                  )}
                </Field>
                <div className="mt-8">
                  <button
                    type="button"
                    className="text-electric-violet border border-electric-violet mr-2 py-1 w-[98px] rounded hover:opacity-75"
                    onClick={() => setIsOpen(false)}
                  >
                    Not now
                  </button>
                  <button
                    type="submit"
                    className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 px-4 rounded hover:opacity-75"
                  >
                    Add email
                  </button>
                </div>
              </form>
            )
          }}
        />
      </div>
    </Modal>
  )
}

export default GetNotifiedModal
