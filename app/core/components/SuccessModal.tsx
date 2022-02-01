import Modal from "./Modal"
import Button from "./Button"

const pronounsMapping = {
  ["she/her"]: "she",
  ["he/him"]: "he",
}
const SuccessModal = ({
  isSuccessModalOpen,
  setIsSuccessModalOpen,
  selectedUserToEndorse: contributor,
}) => {
  return (
    <Modal
      title={`You've endorsed ${contributor?.data?.name}`}
      subtitle={`Share with your team how amazing ${
        pronounsMapping[contributor?.data?.pronouns]
      } is.`}
      open={isSuccessModalOpen}
      toggle={(close) => {
        setIsSuccessModalOpen(close)
      }}
    >
      <Button
        onClick={() => setIsSuccessModalOpen(false)}
        className="w-1/2 mt-12"
        loading={undefined}
        disabled={undefined}
      >
        Go to Waiting Room
      </Button>
    </Modal>
  )
}

export default SuccessModal
