import { useRouter, Routes } from "blitz"
import { Sizes } from "../utils/constants"
import Avatar from "./sds/images/avatar"

export const CollaboratorPfps = ({ accounts }) => {
  const router = useRouter()
  return (
    <div className="flex flex-row">
      {accounts?.length
        ? accounts.map(({ address, data: { pfpURL } }, idx) => {
            const pfpStyling = "h-6 w-6 rounded-full border block border-wet-concrete"
            const nestedStyling = idx ? "ml-[-8px]" : ""

            return (
              <button
                className={`bg-contain bg-clip-padding ${pfpStyling} ${nestedStyling}`}
                key={address}
                onClick={() => router.push(Routes.WorkspaceHome({ accountAddress: address }))}
              >
                <Avatar size={Sizes.SM} pfpURL={pfpURL} address={address} />
              </button>
            )
          })
        : ""}
    </div>
  )
}
