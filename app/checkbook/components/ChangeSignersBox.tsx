import { useParam } from "@blitzjs/next"
import Button from "app/core/components/sds/buttons/Button"
import { useSafeMetadata } from "app/safe/hooks/useSafeMetadata"
import dynamic from "next/dynamic"
import { useState } from "react"

export const SignerActionComponent = ({ signerAddress }) => {
  return (
    <div>
      <p className="text-marble-white">{signerAddress}</p>
    </div>
  )
}

const AddNewSignerModal = dynamic(() => import("./AddNewSignerModal"), {
  ssr: false,
})
export const ChangeSignersBox = ({ className }: { className?: string }) => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const [addNewSignerModalOpen, setAddNewSignerModalOpen] = useState<boolean>(false)
  const { safe } = useSafeMetadata({ chainId: checkbookChainId, address: checkbookAddress })

  return (
    <>
      {addNewSignerModalOpen && (
        <AddNewSignerModal
          isOpen={addNewSignerModalOpen}
          setIsOpen={setAddNewSignerModalOpen}
          safe={safe}
        />
      )}
      <div className={`bg-charcoal w-1/2 min-w-fit rounded p-6 ${className}`}>
        <h1 className="text-lg font-bold">Signers</h1>
        <div className="mt-4">
          {safe?.signers?.map((signerAddress) => {
            return <SignerActionComponent signerAddress={signerAddress} key={signerAddress} />
          })}
          <Button className="mt-6" onClick={() => setAddNewSignerModalOpen(true)}>
            Add new owner
          </Button>
        </div>
      </div>
    </>
  )
}
