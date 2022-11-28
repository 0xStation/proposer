import Modal from "app/core/components/Modal"
import { useState } from "react"
import { AttachTransactionForm } from "app/proposalPayment/components/AttachTransactionForm"
import { DirectPayment } from "app/proposalPayment/components/DirectPayment"

enum Tab {
  DIRECT_PAYMENT = "DIRECT_PAYMENT",
  ATTACH_TRANSACTION = "ATTACH_TRANSACTION",
}
export const ExecutePaymentModal = ({ isOpen, setIsOpen, proposal, milestone, payment }) => {
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.DIRECT_PAYMENT)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <div className="space-x-4 text-l mt-4">
          <span
            className={`${
              selectedTab === Tab.DIRECT_PAYMENT && "border-b mb-[-1px] font-bold"
            } cursor-pointer`}
            onClick={() => {
              console.log(isOpen)
              setSelectedTab(Tab.DIRECT_PAYMENT)
              console.log(isOpen)
            }}
          >
            Direct payment
          </span>
          <span
            className={`${
              selectedTab === Tab.ATTACH_TRANSACTION && "border-b mb-[-1px] font-bold"
            } cursor-pointer`}
            onClick={() => setSelectedTab(Tab.ATTACH_TRANSACTION)}
          >
            Attach transaction
          </span>
        </div>
        {selectedTab === Tab.DIRECT_PAYMENT ? (
          <>
            <DirectPayment
              proposal={proposal}
              milestone={milestone}
              payment={payment}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setIsOpen={setIsOpen}
            />
            <p className="text-xs">
              Already paid?{" "}
              <button
                onClick={() => {
                  setSelectedTab(Tab.ATTACH_TRANSACTION)
                }}
              >
                <span className="text-electric-violet">Paste a transaction link</span>
              </button>
              .
            </p>
          </>
        ) : (
          <AttachTransactionForm
            milestone={milestone}
            chainId={payment?.data?.token.chainId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setIsOpen={setIsOpen}
          />
        )}
      </div>
    </Modal>
  )
}

export default ExecutePaymentModal
