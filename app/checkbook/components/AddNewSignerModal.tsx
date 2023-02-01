import { useMutation } from "@blitzjs/rpc"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import { useState } from "react"
import BackIcon from "/public/back-icon.svg"
import Image from "next/image"
import Modal from "app/core/components/sds/overlays/modal"
import Button from "app/core/components/sds/buttons/Button"
import createCheck from "app/check/mutations/createCheck"
import { CheckType } from "app/check/types"
import { prepareAddSignerWithThresholdTransaction } from "app/transaction/addSignerWithThreshold"
import { useSignCheck } from "app/check/hooks/useSignCheck"
import deleteCheckById from "../../check/mutations/deleteCheckById"
import { ADD_SIGNER_AND_THRESHOLD_CHANGE } from "app/core/utils/constants"

const AddNewAddressView = ({ newSigner, setNewSigner, signerAddresses, setPage }) => {
  const [error, setError] = useState<string>("")
  return (
    <div>
      <div>
        <label className="block">Enter an address</label>
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
          }}
          onBlur={(e) => {
            // validate
            if (!e.target.value) {
              setError("Please enter a value.")
              return
            }
            if (!ethersIsAddress(e.target.value)) {
              setError("Not a valid address.")
              return
            }
            if (signerAddresses?.find((signerAddress) => signerAddress === e.target.value)) {
              setError("Address already added.")
              return
            }
          }}
        />
        <p className="text-torch-red">{error}</p>
      </div>
      <div className="w-full mt-6 flex flex-row-reverse">
        <Button isDisabled={newSigner === "" || Boolean(error)} onClick={() => setPage("2")}>
          Next
        </Button>
      </div>
    </div>
  )
}

export const AddNewSignerModal = ({
  isOpen,
  setIsOpen,
  safe,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  safe: any
}) => {
  const [newSigner, setNewSigner] = useState<string>("")
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

  const { signCheck } = useSignCheck()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { value, data } = prepareAddSignerWithThresholdTransaction(
      safe?.address,
      newSigner,
      editedQuorum
    )
    const newCheck = await createCheckMutation({
      chainId: safe?.chainId,
      address: safe?.address,
      title: ADD_SIGNER_AND_THRESHOLD_CHANGE,
      to: safe?.address,
      value,
      data: data,
      meta: {
        type: CheckType.NewSignerAndThresholdChange,
        prevQuorum: safe?.quorum,
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
        <h1 className="text-2xl font-bold">
          {page === "1" ? "Add new signer" : "Would you like to set a new threshold?"}
        </h1>
        <p className="mt-4">
          Executed transactions will not change, however increasing the quorum might revert “ready”
          txns as pending. If decreasing the quorum, some “pending” txns might change to “ready”.
        </p>
        <form className="mt-4" onSubmit={handleSubmit}>
          {page === "2" && (
            <div>
              <input
                type="number"
                className="w-14 rounded p-2 border-none hover:cursor-pointer bg-wet-concrete mr-2"
                aria-label="changeThreshold"
                value={editedQuorum}
                min={1}
                max={safe?.signers.length}
                onChange={(e) => {
                  setEditedQuorum(parseInt(e.target.value))
                }}
              />
              out of {safe?.signers.length} owners
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
            <AddNewAddressView
              newSigner={newSigner}
              setNewSigner={setNewSigner}
              signerAddresses={safe?.signers}
              setPage={setPage}
            />
          )}
        </form>
      </div>
    </Modal>
  )
}

export default AddNewSignerModal
