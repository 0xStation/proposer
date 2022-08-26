import Modal from "app/core/components/Modal"
import { Link, Image } from "blitz"
import RfpPublishStepper from "public/rfp-publish-stepper.svg"
import Button from "app/core/components/sds/buttons/Button"
import { ButtonType } from "app/core/components/sds/buttons/Button"
import { LINKS } from "app/core/utils/constants"

export const ConfirmationRfpModal = ({ isOpen, setIsOpen, handleSubmit }) => {
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Publishing project</h3>
        <p className="mt-2 mr-24">
          Contributors will be able to submit proposals after the open date. You can edit your
          project at any time.
        </p>
        <div className="py-8 text-center">
          <Image src={RfpPublishStepper} alt="RFP Publish Stepper." />
        </div>
        <div className="mt-8">
          <Button className="mr-2" onClick={() => setIsOpen(false)} type={ButtonType.Secondary}>
            Cancel
          </Button>
          <Button isSubmitType={true} onClick={() => handleSubmit()}>
            Continue
          </Button>
          <Link href={LINKS.CHECKBOOK} passHref>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="ml-10 text-electric-violet font-bold"
            >
              Learn more about Checkbook
            </a>
          </Link>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmationRfpModal
