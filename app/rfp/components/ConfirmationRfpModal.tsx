import Modal from "app/core/components/Modal"
import Button from "app/core/components/sds/buttons/Button"
import { ButtonType } from "app/core/components/sds/buttons/Button"

export const ConfirmationRfpModal = ({ isOpen, setIsOpen, handleSubmit }) => {
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Publishing project</h3>
        <p className="mt-2 mr-24">
          Contributors will be able to submit proposals after the open date. You can edit your
          project at any time.
        </p>
        <div className="mt-8">
          <Button onClick={() => setIsOpen(false)} type={ButtonType.Secondary}>
            Cancel
          </Button>
          <Button isSubmitType={true} onClick={() => handleSubmit()}>
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmationRfpModal
