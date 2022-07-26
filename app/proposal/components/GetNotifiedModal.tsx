import { useEffect, useState } from "react"
import { Field, Form } from "react-final-form"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import { useMutation } from "blitz"
import saveAccountEmail from "app/account/mutations/saveAccountEmail"
import { composeValidators, requiredField, isValidEmail } from "app/utils/validators"
import sendVerificationEmail from "app/email/mutations/sendVerificationEmail"

const GetNotifiedModal = ({ isOpen, setIsOpen }) => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const [showEmailVerificationView, setShowEmailVerificationView] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [emailVerificationSent, setEmailVerificationSent] = useState<boolean>(false)

  const [saveEmailMutation] = useMutation(saveAccountEmail, {
    onSuccess: async () => {
      setShowEmailVerificationView(true)
    },
    onError: (error: Error) => {
      console.error(error)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: `Something went wrong! ${error}`,
      })
    },
  })

  const [sendVerificationEmailMutation] = useMutation(sendVerificationEmail, {
    onSuccess: async () => {
      setTimeout(() => setIsOpen(false), 800)
    },
    onError: (error: Error) => {
      console.error(error)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: `Something went wrong! ${error}`,
      })
    },
  })

  useEffect(() => {
    // close modal if user has already saved an email
    if (!!activeUser?.data.hasSavedEmail) {
      setIsOpen(false)
    }
  }, [activeUser?.data.hasSavedEmail])

  const addEmailView = (
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
            saveEmailMutation({ accountId: activeUser.id, email: values.email })
            setEmail(values.email)
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
  )

  const emailVerificationView = (
    <div className="p-2">
      <h3 className="text-2xl font-bold pt-6">Check your email</h3>
      <p className="pt-3 pb-9">
        We&apos;ve sent a temporary activation link. Go to your inbox at {email} and confirm to
        start receiving updates about your proposals.
      </p>
      <button
        className="text-electric-violet border border-electric-violet h-[35px] rounded px-6 hover:bg-wet-concrete"
        onClick={async () => {
          setEmailVerificationSent(true)
          await sendVerificationEmailMutation({ accountId: activeUser?.id as number })
        }}
      >
        {!emailVerificationSent ? "Resend" : "Sent!"}
      </button>
    </div>
  )

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      {showEmailVerificationView ? emailVerificationView : addEmailView}
    </Modal>
  )
}

export default GetNotifiedModal
