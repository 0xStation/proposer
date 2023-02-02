import { useParam } from "@blitzjs/next"
import { PencilIcon, TrashIcon } from "@heroicons/react/solid"
import Button from "app/core/components/sds/buttons/Button"
import { useSafeMetadata } from "app/safe/hooks/useSafeMetadata"
import dynamic from "next/dynamic"
import { useState } from "react"

export const SignerActionComponent = ({
  signerAddress,
  setReplaceSignerModalOpen,
  setSelectedSignerAddress,
}) => {
  return (
    <div className="flex flex-row justify-between border-b border-b-concrete py-3 px-1 rounded">
      <p className="text-marble-white">{signerAddress}</p>
      <div className="flex flex-row">
        <button
          className="hover:bg-wet-concrete rounded px-1 mr-3"
          onClick={() => {
            setSelectedSignerAddress(signerAddress)
            setReplaceSignerModalOpen(true)
          }}
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <TrashIcon className="h-5 w-5" />
      </div>
    </div>
  )
}

const AddNewSignerModal = dynamic(() => import("./AddNewSignerModal"), {
  ssr: false,
})

const ReplaceSignerModal = dynamic(() => import("./ReplaceSignerModal"), {
  ssr: false,
})

export const ChangeSignersBox = ({ className }: { className?: string }) => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const [addNewSignerModalOpen, setAddNewSignerModalOpen] = useState<boolean>(false)
  const [replaceSignerModalOpen, setReplaceSignerModalOpen] = useState<boolean>(false)
  const [selectedSignerAddress, setSelectedSignerAddress] = useState<string>("")
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
      {replaceSignerModalOpen && (
        <ReplaceSignerModal
          isOpen={replaceSignerModalOpen}
          setIsOpen={setReplaceSignerModalOpen}
          selectedSignerAddress={selectedSignerAddress}
          safe={safe}
        />
      )}
      <div className={`bg-charcoal w-1/2 min-w-fit rounded p-6 ${className}`}>
        <h1 className="text-lg font-bold">Signers</h1>
        <div className="mt-4">
          {safe?.signers?.map((signerAddress) => {
            return (
              <SignerActionComponent
                signerAddress={signerAddress}
                key={signerAddress}
                setSelectedSignerAddress={setSelectedSignerAddress}
                setReplaceSignerModalOpen={setReplaceSignerModalOpen}
              />
            )
          })}
          <Button className="mt-6" onClick={() => setAddNewSignerModalOpen(true)}>
            Add new owner
          </Button>
        </div>
      </div>
    </>
  )
}
