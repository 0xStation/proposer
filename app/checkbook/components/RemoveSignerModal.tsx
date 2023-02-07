import { useMutation } from "@blitzjs/rpc"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import { useState } from "react"
import BackIcon from "/public/back-icon.svg"
import Image from "next/image"
import Modal from "app/core/components/sds/overlays/modal"
import Button from "app/core/components/sds/buttons/Button"
import createCheck from "app/check/mutations/createCheck"
import { CheckType } from "app/check/types"
import { useSignCheck } from "app/check/hooks/useSignCheck"
import deleteCheckById from "../../check/mutations/deleteCheckById"
import { REMOVE_SIGNER, SENTINEL_ADDRESS } from "app/core/utils/constants"
import { useGetOwners } from "app/safe/hooks/useGetOwners"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { prepareRemoveSignerTransaction } from "app/transaction/removeSigner"

export const RemoveSignerModal = ({
  isOpen,
  setIsOpen,
  safe,
  selectedSignerAddress,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  safe: any
  selectedSignerAddress: string
}) => {
  const [page, setPage] = useState<"1" | "2">("1")
  const [editedQuorum, setEditedQuorum] = useState<number>(safe?.quorum)
  const [isLoading, setIsLoading] = useState<boolean>(false)
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
    const { value, data } = prepareRemoveSignerTransaction(
      safe?.address,
      prevSignerAddress,
      selectedSignerAddress,
      editedQuorum
    )
    const newCheck = await createCheckMutation({
      chainId: safe?.chainId,
      address: safe?.address,
      title: REMOVE_SIGNER,
      to: safe?.address,
      value,
      data: data,
      meta: {
        type: CheckType.NewSignerAndThresholdChange,
        prevQuorum: safe?.quorum,
      },
      delegatecall: false,
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
        <h1 className="text-2xl font-bold">
          {page === "1" ? "Remove signer" : "Would you like to set a new threshold?"}
        </h1>
        {page === "2" && (
          <p className="mt-4">
            Executed transactions will not change, however increasing the quorum might revert
            “ready” txns as pending. If decreasing the quorum, some “pending” txns might change to
            “ready”.
          </p>
        )}
        <form className="mt-4" onSubmit={handleSubmit}>
          {page === "2" && (
            <div>
              <input
                type="number"
                className="w-14 rounded p-2 border-none hover:cursor-pointer bg-wet-concrete mr-2"
                aria-label="changeThreshold"
                value={editedQuorum}
                min={1}
                max={safe?.signers.length - 1}
                onChange={(e) => {
                  setEditedQuorum(parseInt(e.target.value))
                }}
              />
              out of {safe?.signers.length - 1} signers.
              <div className="w-full flex flex-row justify-between mt-8">
                <button
                  className="h-[20px] w-[20px] self-center"
                  onClick={() => {
                    setPage("1")
                  }}
                >
                  <Image src={BackIcon} alt="Back icon" />
                </button>
                <Button className="block" isSubmitType={true} isLoading={isLoading}>
                  Submit
                </Button>
              </div>
            </div>
          )}
          {page === "1" && (
            <div>
              {safe?.signers?.length > 1 ? (
                <>
                  <p>Review whether the following address should be removed:</p>
                  <p className="mt-4">{selectedSignerAddress}</p>
                  <div className="w-full mt-6 flex flex-row-reverse">
                    <Button onClick={() => setPage("2")}>Next</Button>
                  </div>
                </>
              ) : (
                <>
                  <p>Cannot remove only signer on safe</p>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </Modal>
  )
}

export default RemoveSignerModal
