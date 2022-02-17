import Modal from "../../core/components/Modal"
import AccountForm from "./AccountForm"

const AccountModal = ({
  isOpen,
  setIsOpen,
  address,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  address: string
}) => {
  return (
    <Modal
      title="Complete your profile"
      subtitle="Complete your profile to explore initiatives."
      open={isOpen}
      toggle={setIsOpen}
    >
      <div className="mt-8">
        <AccountForm onSuccess={() => setIsOpen(false)} address={address} />
      </div>
    </Modal>
  )
}

export default AccountModal
