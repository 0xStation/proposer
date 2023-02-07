import Modal from "app/core/components/Modal"
import * as Accordion from "@radix-ui/react-accordion"
import { useState } from "react"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { Check, CheckStatus } from "../types"
import useStore from "app/core/hooks/useStore"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { useSignCheck } from "../hooks/useSignCheck"
import { useExecuteCheck } from "../hooks/useExecuteCheck"
import { useIsUserSigner } from "app/safe/hooks/useIsUserSigner"
import { CheckAccordion } from "./CheckAccordion"
import useBatchCheckStatus from "../hooks/useBatchCheckStatus"

export const BatchCheckModal = ({
  checks,
  isOpen,
  setIsOpen,
  form,
}: {
  checks: Check[]
  isOpen: boolean
  setIsOpen: (open) => void
  form: any
}) => {
  const activeUser = useStore((state) => state.activeUser)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { status } = useBatchCheckStatus({
    checks: checks,
  })

  // need multicall to check if user is signer of all txns and safes
  const userIsSigner = useIsUserSigner({
    chainId: checks[0]?.chainId,
    safeAddress: checks[0]?.address,
    userAddress: activeUser?.address,
  })
  const userHasSigned = checks[0]?.proofs
    ?.map((proof) => proof.signature)
    ?.some((signature) => addressesAreEqual(signature.signer, activeUser?.address))

  const { signCheck } = useSignCheck()
  const { executeCheck } = useExecuteCheck({ check: checks[0], setIsLoading })

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <h1 className="px-6 pt-6 text-2xl font-bold">Approve actions</h1>
      <div className="px-6 pb-6 mt-4">
        <Accordion.Root className="w-full" type="single" defaultValue="item-1" collapsible>
          {checks.map((check, idx) => {
            return <CheckAccordion check={check} idx={idx} key={idx} />
          })}
        </Accordion.Root>
        {userIsSigner ? (
          status === CheckStatus.PENDING ? (
            userHasSigned ? (
              <Button className="mt-8" isDisabled={true} type={ButtonType.Unemphasized}>
                Signed
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  const success = await signCheck({ checks: checks, setIsLoading })
                  if (success) {
                    form.reset()
                    setIsOpen(false)
                  }
                }}
                isLoading={isLoading}
                className="mt-8"
              >
                Sign Check
              </Button>
            )
          ) : status === CheckStatus.READY ? (
            <Button onClick={executeCheck} isLoading={isLoading} className="mt-8">
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

export default BatchCheckModal
