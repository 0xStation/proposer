import { Spinner } from "app/core/components/Spinner"

export const ProposalCreationLoadingScreen = ({ createdProposal }) => {
  return (
    <div className="flex flex-col justify-center items-center mt-48">
      <p className="text-concrete tracking-wide">
        {!createdProposal ? "Creating proposal..." : "Sign to prove your authorship."}
      </p>
      {createdProposal && (
        <p className="text-concrete tracking-wide">Check your wallet for your next action.</p>
      )}
      <div className="h-4 w-4 mt-6">
        <Spinner fill="white" />
      </div>
    </div>
  )
}
