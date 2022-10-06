import { addressesAreEqual } from "./addressesAreEqual"

export const activeUserMeetsCriteria = (activeUser, criteriaObjArray) => {
  return criteriaObjArray?.some((criteriaObj) => {
    return addressesAreEqual(activeUser?.address || "", criteriaObj.address)
  })
}
