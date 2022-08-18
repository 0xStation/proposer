import db from "../index"

const seed = async () => {
  /**
   * get all rfps
   * save senderAddress, senderType, chainId to metadata
   * save new publishSignature structure
   *
   * get all proposals of rfps
   * save senderAddress, senderType to metadata
   *
   * get all proposals and approvals
   * save proposal status with IN_REVIEW or APPROVED for non-zero approvals
   */
}

export default seed
