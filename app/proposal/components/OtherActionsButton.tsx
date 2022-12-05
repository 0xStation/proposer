import { DotsHorizontalIcon } from "@heroicons/react/solid"
import Dropdown from "app/core/components/Dropdown"
import useStore from "app/core/hooks/useStore"

export const OtherActionsButton = ({ proposalUrl }) => {
  const setToastState = useStore((state) => state.setToastState)

  return (
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
            console.log("click!")
          },
        },
      ]}
    />
  )
}
