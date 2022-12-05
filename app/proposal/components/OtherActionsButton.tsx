import { Routes } from "@blitzjs/next"
import { DotsHorizontalIcon } from "@heroicons/react/solid"
import Dropdown from "app/core/components/Dropdown"
import useStore from "app/core/hooks/useStore"
import { genPathFromUrlObject } from "app/utils"
import { useState } from "react"
import { DeleteProposalModal } from "./DeleteProposalModal"

export const OtherActionsButton = ({ proposalId }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)

  const proposalUrl =
    typeof window !== "undefined"
      ? genPathFromUrlObject(
          Routes.ViewProposal({
            proposalId,
          })
        )
      : ""

  return (
    <>
      <DeleteProposalModal
        isOpen={deleteModalOpen}
        setIsOpen={setDeleteModalOpen}
        proposalId={proposalId}
      />
      <Dropdown
        //   side="left"
        button={
          <DotsHorizontalIcon className="p-2 h-8 w-8 cursor-pointer fill-marble-white rounded-md hover:bg-charcoal" />
        }
        items={[
          {
            name: "Copy link",
            onClick: () => {
              navigator.clipboard.writeText(proposalUrl).then(() => {
                setToastState({
                  isToastShowing: true,
                  type: "success",
                  message: "Proposal link copied",
                })
              })
            },
          },
          {
            name: "Delete",
            onClick: () => {
              setDeleteModalOpen(true)
            },
          },
        ]}
      />
    </>
  )
}
