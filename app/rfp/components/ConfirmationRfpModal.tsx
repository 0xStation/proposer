import Modal from "app/core/components/Modal"
import { Link, Image } from "blitz"
import RfpPublishStepper from "public/rfp-publish-stepper.svg"

export const ConfirmationRfpModal = ({ isOpen, setIsOpen, handleSubmit }) => {
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">Publishing project</h3>
        <p className="mt-2 mr-24">
          Contributors will be able to submit proposals after the open date. You can edit your
          project at any time.
        </p>
        <div className="py-8">
          <Image src={RfpPublishStepper} alt="RFP Publish Stepper." />
        </div>
        <div>
          <button
            type="button"
            className="text-electric-violet border border-electric-violet mr-2 py-1 px-4 rounded hover:opacity-75"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-electric-violet text-tunnel-black border border-electric-violet mr-10 py-1 px-4 rounded hover:opacity-75"
            onClick={() => handleSubmit()}
          >
            Continue
          </button>
          <Link
            href="https://station-labs.gitbook.io/station-product-manual/for-daos-communities/checkbook"
            passHref
          >
            <a target="_blank" rel="noopener noreferrer" className="text-electric-violet font-bold">
              Learn more about Checkbook
            </a>
          </Link>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmationRfpModal
