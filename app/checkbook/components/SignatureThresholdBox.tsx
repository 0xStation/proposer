import { useParam } from "@blitzjs/next"
import Button from "app/core/components/sds/buttons/Button"
import { useSafeMetadata } from "app/safe/hooks/useSafeMetadata"
import dynamic from "next/dynamic"
import { useState } from "react"

const ChangeThresholdModal = dynamic(() => import("./ChangeThresholdModal"), {
  ssr: false,
})
export const SignatureThresholdBox = ({ className }: { className?: "" }) => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const [changeThresholdModalOpen, setChangeThresholdModalOpen] = useState<boolean>(false)
  const { safe } = useSafeMetadata({ chainId: checkbookChainId, address: checkbookAddress })

  return (
    <>
      {changeThresholdModalOpen && (
        <ChangeThresholdModal
          isOpen={changeThresholdModalOpen}
          setIsOpen={setChangeThresholdModalOpen}
          safe={safe}
        />
      )}
      <div className={`bg-charcoal w-1/2 rounded p-6 ${className}`}>
        <h1 className="text-lg font-bold">Signature threshold</h1>
        <div className="mt-4">
          Number of required owners to sign an action before it&apos;s executed.
          <p className="mt-4">
            {safe?.quorum} out of <span className="font-bold">{safe?.signers?.length}</span> owners.
          </p>
          <Button className="mt-6" onClick={() => setChangeThresholdModalOpen(true)}>
            Change
          </Button>
        </div>
      </div>
    </>
  )
}
