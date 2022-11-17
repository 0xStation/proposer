import Modal from "app/core/components/Modal"
import { RadioGroup } from "@headlessui/react"
import { useEffect, useState } from "react"
import { classNames } from "app/core/utils/classNames"
import { ProposalRoleType } from "@prisma/client"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
import useStore from "app/core/hooks/useStore"

export const RfpPreCreateModal = ({
  isOpen,
  setIsOpen,
  accountAddress,
}: {
  isOpen: boolean
  setIsOpen: (open) => void
  accountAddress: string
}) => {
  const [lookingFor, setLookingFor] = useState<ProposalRoleType | null>()
  const router = useRouter()
  const setToastState = useStore((state) => state.setToastState)

  useEffect(() => {
    if (!isOpen) {
      setLookingFor(null)
    }
  })

  const LookingForOption = ({ value, title, subtitle }) => {
    return (
      <RadioGroup.Option value={value}>
        {({ checked }) => (
          <>
            <div
              className={classNames(
                checked ? "border-marble-white" : "border-wet-concrete hover:bg-charcoal",
                "flex flex-col space-y-1 justify relative flex cursor-pointer rounded-lg border p-4"
              )}
            >
              <h4 className="text-lg">{title}</h4>
              <div className="text-concrete text-xs">{subtitle}</div>
            </div>
          </>
        )}
      </RadioGroup.Option>
    )
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-6">
        <RadioGroup value={lookingFor} onChange={setLookingFor} className="mt-4">
          <RadioGroup.Label className="text-2xl font-bold text-marble-white">
            What are you looking for?
          </RadioGroup.Label>
          <div className="mt-4 space-y-2">
            <LookingForOption
              value={ProposalRoleType.CLIENT}
              title="Looking for clients"
              subtitle="Solicit proposals from potential clients"
            />
            <LookingForOption
              value={ProposalRoleType.CONTRIBUTOR}
              title="Looking for contributors"
              subtitle="Solicit proposals from contributors to work on your next project"
            />
          </div>
        </RadioGroup>
        <Button
          type={ButtonType.Primary}
          className="my-10 float-right"
          isDisabled={
            lookingFor !== ProposalRoleType.CLIENT && lookingFor !== ProposalRoleType.CONTRIBUTOR
          }
          onClick={() => {
            // should not trigger because of disable condition, but just in case
            if (!lookingFor) {
              setToastState({
                isToastShowing: true,
                type: "error",
                message: "No selection made.",
              })
              return
            }
            router.push(Routes.RfpNew({ accountAddress, lookingFor: lookingFor.toLowerCase() }))
          }}
        >
          Next
        </Button>
      </div>
    </Modal>
  )
}

export default RfpPreCreateModal
