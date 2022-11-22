import { invalidateQuery } from "@blitzjs/rpc"
import getRfpById from "app/rfp/queries/getRfpById"
import { useEffect } from "react"

// hook to refresh the RFP based on a start or end date
export const useRefreshRfp = (date?: Date | null) => {
  useEffect(() => {
    if (!date) return
    const refreshDelay = date.getTime() - Date.now()
    if (refreshDelay < 0) return
    // set timer to refresh RFP detail view once we hit refresh date
    setTimeout(() => {
      invalidateQuery(getRfpById)
    }, refreshDelay)
  }, [date])
}
