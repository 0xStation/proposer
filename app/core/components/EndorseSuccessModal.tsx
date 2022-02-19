import Modal from "./Modal"
import Button from "./Button"

const EndorseSuccessModal = ({
  isSuccessModalOpen,
  setIsSuccessModalOpen,
  selectedUserToEndorse: contributor,
}) => {
  return (
    <Modal
      title={`You've endorsed ${contributor?.data?.name}!`}
      subtitle={`You can help ${contributor?.data?.name} gather more endorsements by collaborating on projects and talking about their contribution in your community.`}
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

export default EndorseSuccessModal
