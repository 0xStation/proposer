import Modal from "app/core/components/Modal"
import { useState } from "react"
import { DirectPayment } from "app/proposalPayment/components/DirectPayment"

export const ExecutePaymentModal = ({ isOpen, setIsOpen, proposal, milestone, payment }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <DirectPayment
          proposal={proposal}
          milestone={milestone}
          payment={payment}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setIsOpen={setIsOpen}
        />
      </div>
    </Modal>
  )
}

export default ExecutePaymentModal
