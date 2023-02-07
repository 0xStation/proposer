import Modal from "app/core/components/Modal"
import { useState } from "react"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { CheckDetails } from "./CheckDetails"
import { Check, CheckStatus } from "../types"
import useStore from "app/core/hooks/useStore"
import { CheckSignature } from "app/checkSignature/types"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import useCheckStatus from "../hooks/useCheckStatus"
import { useSignCheck } from "../hooks/useSignCheck"
import { useExecuteCheck } from "../hooks/useExecuteCheck"
import { useIsUserSigner } from "app/safe/hooks/useIsUserSigner"
import { CheckHeader } from "./CheckHeader"

export const ViewCheckModal = ({
  check,
  isOpen,
  setIsOpen,
}: {
  check: Check
  isOpen: boolean
  setIsOpen: (open) => void
}) => {
  const activeUser = useStore((state) => state.activeUser)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { status } = useCheckStatus({ check })

  const userIsSigner = useIsUserSigner({
    chainId: check.chainId,
    safeAddress: check.address,
    userAddress: activeUser?.address,
  })
  const userHasSigned = check?.proofs
    ?.map((proof) => proof.signature)
    ?.some((signature) => addressesAreEqual(signature.signer, activeUser?.address))

  const { signCheck } = useSignCheck()
  const { executeCheck } = useExecuteCheck({ check, setIsLoading })

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-6 mt-4">
        <CheckHeader check={check} />
        <CheckDetails check={check} className="mt-4" />
        {userIsSigner ? (
          status === CheckStatus.PENDING ? (
            userHasSigned ? (
              <Button className="mt-8" isDisabled={true} type={ButtonType.Unemphasized}>
                Signed
              </Button>
            ) : (
              <Button
                className="mt-8"
                isLoading={isLoading}
                onClick={async () => {
                  const success = await signCheck({ checks: [check], setIsLoading })
                  if (success) {
                    setIsOpen(false)
                  }
                }}
              >
                Sign Check
              </Button>
            )
          ) : status === CheckStatus.READY ? (
            <Button
              className="mt-8"
              isLoading={isLoading}
              onClick={async () => {
                const success = await executeCheck()
                if (success) {
                  setIsOpen(false)
                }
              }}
            >
              Execute Check
            </Button>
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
      </div>
    </Modal>
  )
}

export default ViewCheckModal
