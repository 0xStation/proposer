import { useQuery } from "blitz"
import getAccountsByAddresses from "app/account/queries/getAccountsByAddresses"

const InitiativeCard = ({ title, description, members }) => {
  let [contributors] = useQuery(
    getAccountsByAddresses,
    { addresses: members || [] },
    { suspense: false }
  )

  return (
    <div className="border border-concrete p-4 flex flex-col cursor-pointer h-full hover:border-marble-white">
      <h3 className="text-marble-white text-lg">{title}</h3>
      <p className="text-marble-white text-base mt-2 grow">{description}</p>
      <div className="mt-8 flex flex-row">
        {contributors?.length
          ? contributors.slice(0, 5).map(({ data: { pfpURL } }, idx) => {
              const pfpStyling = "h-6 w-6 rounded-full border block border-marble-white"
              const nestedStyling = idx ? "ml-[-5px]" : ""
              if (idx === 4) {
                const additionalContributors = (contributors?.length || 0) - 4
                return (
                  <span
                    key={idx}
                    className={`bg-neon-blue text-marble-white text-[10px] text-center items-center pt-1 ${pfpStyling} ${nestedStyling}`}
                  >
                    {additionalContributors}+
                  </span>
                )
              }
              let pfpBubble = pfpURL ? (
                <span
                  key={idx}
                  className={`bg-contain bg-clip-padding ${pfpStyling} ${nestedStyling}`}
                  style={{ backgroundImage: `url(${pfpURL})` }}
                ></span>
              ) : (
                <span key={idx} className={`bg-concrete ${pfpStyling} ${nestedStyling}`}></span>
              )
              return pfpBubble
            })
          : "N/A"}
      </div>
    </div>
  )
}

export default InitiativeCard
