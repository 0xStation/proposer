import Modal from "./Modal"
import Button from "./Button"

const SuccessModal = ({
  isSuccessModalOpen,
  setIsSuccessModalOpen,
  selectedUserToEndorse: contributor,
}) => {
  return (
    <Modal
      title={`You've endorsed ${contributor?.data?.handle}`}
      subtitle={`Share with your team how amazing they are.`}
      open={isSuccessModalOpen}
      toggle={(close) => {
        setIsSuccessModalOpen(close)
      }}
    >
      <Button onClick={() => setIsSuccessModalOpen(false)} className="w-1/2 mt-12">
        Go to Waiting Room
      </Button>
    </Modal>
  )
}

export default SuccessModal
