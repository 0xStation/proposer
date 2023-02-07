import { useMutation, invoke } from "@blitzjs/rpc"
import { useEffect, useState } from "react"
import Modal from "app/core/components/sds/overlays/modal"
import Button from "app/core/components/sds/buttons/Button"
import createCheck from "app/check/mutations/createCheck"
import { CheckType } from "app/check/types"
import { prepareChangeThresholdTransaction } from "app/transaction/threshold"
import { useSignCheck } from "app/check/hooks/useSignCheck"
import deleteCheckById from "../../check/mutations/deleteCheckById"
import { THRESHOLD_CHANGE } from "app/core/utils/constants"

export const ChangeThresholdModal = ({
  isOpen,
  setIsOpen,
  safe,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  safe: any
}) => {
  const [editedQuorum, setEditedQuorum] = useState<number>(safe?.quorum)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [sameThreshold, setSameThreshold] = useState<boolean>(true)
  const [isDirty, setIsDirty] = useState<boolean>(false)
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

  useEffect(() => {
    // This is basically checking whether the threshold is dirty and has changed from the original.
    setSameThreshold(Boolean(!safe?.quorum || !editedQuorum || editedQuorum === safe?.quorum))
  }, [safe?.quorum, editedQuorum])

  const { signCheck } = useSignCheck()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { value, data } = prepareChangeThresholdTransaction(safe?.address, editedQuorum)
    const newCheck = await createCheckMutation({
      chainId: safe?.chainId,
      address: safe?.address,
      title: THRESHOLD_CHANGE,
      to: safe?.address,
      value,
      data: data,
      meta: {
        type: CheckType.ThresholdChange,
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
    }

    setIsOpen(false)
  }

  return (
    <Modal
      open={isOpen}
      toggle={() => {
        setIsOpen(!isOpen)
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Change threshold</h1>
        <p className="mt-4">
          Executed transactions will not change, however increasing the quorum might revert “ready”
          txns as pending. If decreasing the quorum, some “pending” txns might change to “ready”.
        </p>
        <form className="mt-4" onSubmit={handleSubmit}>
          <input
            type="number"
            className="w-14 rounded p-2 border-none hover:cursor-pointer bg-wet-concrete mr-2"
            aria-label="changeThreshold"
            value={editedQuorum}
            min={1}
            max={safe?.signers.length}
            onChange={(e) => {
              setIsDirty(true)
              setEditedQuorum(parseInt(e.target.value))
            }}
          />
          out of {safe?.signers.length} signers.
          <p
            className={`${
              isDirty && sameThreshold ? "visible" : "invisible"
            } text-sm text-torch-red pt-2`}
          >
            Current threshold is already {safe?.quorum}
          </p>
          <Button
            className="block mt-4"
            isSubmitType={true}
            isLoading={isLoading}
            isDisabled={sameThreshold}
          >
            Submit
          </Button>
        </form>
      </div>
    </Modal>
  )
}

export default ChangeThresholdModal
