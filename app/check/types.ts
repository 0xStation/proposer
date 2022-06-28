export enum CheckStatus {
  NOT_QUEUED = "NOT QUEUED", // for checks that represent future milestones that have yet to be kickstarted
  PENDING_APPROVAL = "PENDING APPROVAL", // queued and currently in approval process
  UNCLAIMED = "UNCLAIMED", // approved but not cashed by recipient
  CASHED = "CASHED", // cashed by recipient post-approval
}
