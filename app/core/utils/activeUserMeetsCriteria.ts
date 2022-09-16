import { addressesAreEqual } from "./addressesAreEqual"

export const activeUserMeetsCriteria = (activeUser, criteriaObjArray) =>
  criteriaObjArray?.some((criteriaObj) =>
    addressesAreEqual(activeUser?.address || "", criteriaObj.address)
  )
