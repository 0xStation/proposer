import { Field, Form } from "react-final-form"
import Modal from "app/core/components/Modal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"

export const AnnotateProposalVersionModal = ({
  isOpen,
  setIsOpen,
  isSubmitting,
  handleSubmit,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isSubmitting: boolean
  handleSubmit: (annotationValues: any) => Promise<void>
}) => {
  return (
    <Modal
      open={isOpen}
      toggle={() => {
        setIsOpen(!isOpen)
      }}
    >
      <div className="pt-10 pb-6 px-4">
        <h1 className="text-2xl font-bold">Submitting changes to the proposal</h1>
        <p className="text-base mt-6">
          Since you’ve already published this proposal, all other collaborators and signers will
          need to review the new version and re-sign the proposal. The original version will still
          be viewable in this proposal’s version history. Below, you can optionally include a
          message explaining the changes. This is not required but is strongly suggested.
        </p>
        <Form
          onSubmit={async ({ body }: any, form) => {
            await handleSubmit(body)
          }}
          render={({ handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit} className="mt-5 w-full">
                <label className="font-bold block mb-1">Change notes</label>
                <Field component="textarea" name="body">
                  {({ input, meta }) => (
                    <div>
                      <textarea
                        {...input}
                        placeholder="Describe the changes you made."
                        className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2 rounded min-h-[112px] w-full"
                      />
                      {/* this error shows up when the user focuses the field (meta.touched) */}
                      {meta.error && meta.touched && (
                        <span className=" text-xs text-torch-red block">{meta.error}</span>
                      )}
                    </div>
                  )}
                </Field>
                <div className="mt-6 flex justify-end">
                  <Button
                    type={ButtonType.Secondary}
                    className="mr-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    isSubmitType={true}
                    className="block self-end"
                    isDisabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Confirm
                  </Button>
                </div>
              </form>
            )
          }}
        />
      </div>
    </Modal>
  )
}

export default AnnotateProposalVersionModal
