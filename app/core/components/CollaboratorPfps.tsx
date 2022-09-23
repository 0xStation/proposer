import { useRouter, Routes } from "blitz"
import { Sizes } from "../utils/constants"
import Avatar from "./sds/images/avatar"

export const CollaboratorPfps = ({ accounts, size = Sizes.SM }) => {
  const router = useRouter()
  const pfpHeight = size === Sizes.SM ? "h-6 w-6" : size === Sizes.BASE ? "h-8 w-8" : "h-10 w-10"
  return (
    <div className="flex flex-row">
      {accounts?.length
        ? accounts.map(({ address, data: { pfpURL } }, idx) => {
            const pfpStyling = `${pfpHeight} rounded-full border block border-wet-concrete hover:opacity-90`
            const nestedStyling = idx
              ? size === Sizes.SM
                ? "ml-[-8px]"
                : size === Sizes.BASE
                ? "ml-[-14px]"
                : "ml-[-20px]"
              : ""

            return (
              <button
                className={`bg-contain bg-clip-padding ${pfpStyling} ${nestedStyling}`}
                key={address}
                onClick={() => router.push(Routes.WorkspaceHome({ accountAddress: address }))}
              >
                <Avatar size={size} pfpURL={pfpURL} address={address} />
              </button>
            )
          })
        : ""}
    </div>
  )
}
