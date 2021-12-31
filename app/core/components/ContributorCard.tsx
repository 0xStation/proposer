import { users } from "../utils/data"

interface InitiativeContributers {
  user?: {
    handle: string
  }
}

const ContributorCard = (contributors: InitiativeContributers) => {
  return (
    <div className="flex-1 content-center text-marble-white">
      <div className="bg-tunnel-black border border-marble-white p-4">
        <h3 className="text-marble-white text-3xl">Welcome to Station</h3>
        <p className="text-marble-white text-sm mt-4">
          This is where contributors come together and discover and participate in some of the most
          exciting communities in Web3.
        </p>
        <p className="text-marble-white text-sm mt-4">Join the ride.</p>
      </div>
    </div>
  )
}

export default ContributorCard
