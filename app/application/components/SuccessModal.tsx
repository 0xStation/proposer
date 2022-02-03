import Modal from "../../core/components/Modal"
import { useRouter, useParam } from "blitz"

const SuccessModal = ({
  isOpen,
  setIsOpen,
  initiativeName,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  initiativeName: string
}) => {
  const router = useRouter()
  const terminalHandle = useParam("terminalHandle") as string
  return (
    <Modal title="" subtitle="" open={isOpen} toggle={setIsOpen} showTitle={true}>
      <div className="flex flex-col space-y-5 mx-10 px-10 my-2">
        <div className="text-3xl font-medium leading-8 text-marble-white text-center mx-10 px-10">
          You&apos;re in {initiativeName} Waiting Room!
        </div>
        <div className="flex text-center text-marble-white text-sm">
          You’re now in the Waiting Room where Station contributors visit, view your profile, and
          can vouch for you. Reach out to the team, get to know them, and start contributing.
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => {
              router.push(`/terminal/${terminalHandle}/waiting-room`)
            }}
            className="m-1 py-1 text-center text-base bg-magic-mint rounded item-center w-[300px] mt-7"
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default SuccessModal
