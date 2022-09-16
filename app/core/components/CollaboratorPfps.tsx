import { Sizes } from "../utils/constants"
import Avatar from "./sds/images/avatar"

export const CollaboratorPfps = ({ accounts }) => {
  return (
    <div className="flex flex-row">
      {accounts?.length
        ? accounts.map(({ address, data: { pfpURL } }, idx) => {
            const pfpStyling = "h-6 w-6 rounded-full border block border-wet-concrete"
            const nestedStyling = idx ? "ml-[-8px]" : ""

            return (
              <div
                className={`bg-contain bg-clip-padding ${pfpStyling} ${nestedStyling}`}
                key={address}
              >
                <Avatar size={Sizes.SM} pfpURL={pfpURL} address={address} />
              </div>
            )
          })
        : ""}
    </div>
  )
}
