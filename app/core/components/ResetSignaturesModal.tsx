import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import Button, { ButtonType } from "./sds/buttons/Button"
import Modal from "./sds/overlays/modal"

export const ResetSignaturesModal = ({
  isOpen,
  setIsOpen,
  proposalId,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  proposalId: string
}) => {
  const router = useRouter()
  return (
    <Modal
      open={isOpen}
      toggle={() => {
        setIsOpen(!isOpen)
      }}
    >
      <>
        <video autoPlay loop muted>
          <source src="/reset-signature-animation.m4v" />
        </video>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Signatures will reset on publish</h1>
          <p className="text-base mt-6">
            Just as a heads up, since you&apos;ve already published this proposal, all other
            collaborators and signers will need to review the new version and re-sign the proposal.
          </p>

          <div className="mt-6 flex justify-end">
            <Button
              type={ButtonType.Secondary}
              className="block self-end mr-2"
              onClick={() => {
                router.push(Routes.ViewProposal({ proposalId: proposalId as string }))
              }}
            >
              Nevermind
            </Button>
            <Button className="block self-end" onClick={() => setIsOpen(false)}>
              Let&apos;s go!
            </Button>
          </div>
        </div>
      </>
    </Modal>
  )
}

export default ResetSignaturesModal
