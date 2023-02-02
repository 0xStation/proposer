import { useMutation } from "@blitzjs/rpc"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import { useState } from "react"
import Modal from "app/core/components/sds/overlays/modal"
import Button from "app/core/components/sds/buttons/Button"
import createCheck from "app/check/mutations/createCheck"
import { CheckType } from "app/check/types"
import { useSignCheck } from "app/check/hooks/useSignCheck"
import deleteCheckById from "../../check/mutations/deleteCheckById"
import { prepareReplaceSignerTransaction } from "app/transaction/replaceSigner"
import { useGetOwners } from "app/safe/hooks/useGetOwners"
import { addressesAreEqual } from "../../core/utils/addressesAreEqual"
import { REPLACE_SIGNER } from "app/core/utils/constants"

const SENTINEL_ADDRESS = "0x0000000000000000000000000000000000000001"

export const ReplaceSignerModal = ({
  isOpen,
  setIsOpen,
  selectedSignerAddress,
  safe,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  selectedSignerAddress: string
  safe: any
}) => {
  const [newSigner, setNewSigner] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [createCheckMutation] = useMutation(createCheck, {
    onSuccess: (check) => {
      console.log("success!", check)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })
  const [deleteCheckByIdMutation] = useMutation(deleteCheckById, {
    onSuccess: (check) => {
      console.log("successful deletion of check", check)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })
  const owners = useGetOwners({ chainId: safe?.chainId, safeAddress: safe?.address }) as []
  console.log("owners", owners)

  const { signCheck } = useSignCheck()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ownerIndex = owners?.findIndex((owner: string) =>
      addressesAreEqual(owner, selectedSignerAddress)
    )
    const isOwner = ownerIndex >= 0
    if (!isOwner) {
      // show toast
    }
    const prevSignerAddress = ownerIndex === 0 ? SENTINEL_ADDRESS : owners?.[ownerIndex - 1]

    const { value, data } = prepareReplaceSignerTransaction(
      safe?.address,
      prevSignerAddress,
      selectedSignerAddress,
      newSigner
    )
    const newCheck = await createCheckMutation({
      chainId: safe?.chainId,
      address: safe?.address,
      title: REPLACE_SIGNER,
      to: safe?.address,
      value,
      data: data,
      meta: {
        type: CheckType.ReplaceSigner,
        oldSignerAddress: selectedSignerAddress,
        newSignerAddress: newSigner,
      },
    })
    const success = await signCheck({ checks: [newCheck], setIsLoading })
    if (!success) {
      await deleteCheckByIdMutation({
        checkId: newCheck.id,
        safeAddress: safe?.address,
        chainId: safe?.chainId,
      })
    } else {
      setIsOpen(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      toggle={() => {
        setIsOpen(!isOpen)
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Replace signer</h1>
        <p className="mt-4">Review the signer you want to replace, then specify a new signer</p>
        <form className="mt-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2">Current signer:</label>
            <p className="text-concrete mb-4">{selectedSignerAddress}</p>
            <label className="block mb-2">Enter a new signer</label>
            <input
              type="text"
              className="rounded p-2 border-none hover:cursor-pointer bg-wet-concrete mr-2"
              aria-label="addSigner"
              value={newSigner}
              maxLength={50}
              size={50}
              onChange={(e) => {
                setError("")
                setNewSigner(e.target.value)
                if (!e.target.value) {
                  setError("Please enter a value.")
                  return
                }
                if (!ethersIsAddress(e.target.value)) {
                  setError("Not a valid address.")
                  return
                }
                if (
                  safe?.signers?.find((signerAddress) =>
                    addressesAreEqual(signerAddress, e.target.value)
                  )
                ) {
                  setError("Address already added.")
                  return
                }
              }}
            />
            <p className="text-torch-red">{error}</p>
            <div className="w-full flex flex-row justify-between mt-8">
              <Button
                className="block"
                isSubmitType={true}
                isLoading={isLoading}
                isDisabled={Boolean(error || !newSigner)}
              >
                Submit
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default ReplaceSignerModal
