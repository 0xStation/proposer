// addition to EXECUTION utility
// enriches application with metadata and mechanisms for acceptance criteria and reviewers
export type ProposalMilestone = {
  index: number // implies ordering of milestones
  data: ProposalMilestoneMetadata
}

export type ProposalMilestoneMetadata = {
  // missing something on acceptance criteria, reviewers, etc.
  title: string
}
