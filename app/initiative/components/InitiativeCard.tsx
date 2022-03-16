const InitiativeCard = ({ title, oneLiner, contributors, isAcceptingApplications }) => {
  return (
    <div className="border border-concrete p-4 flex flex-col cursor-pointer h-full hover:border-marble-white">
      <h3 className="text-marble-white text-2xl">{title}</h3>
      <p className="text-marble-white text-base mt-2 grow">{oneLiner}</p>
      <div className="flex flex-row space-x-3">
        <div className="mt-8 flex flex-row flex-auto">
          {contributors?.length
            ? contributors.slice(0, 4).map(({ data: { pfpURL } }, idx) => {
                const pfpStyling = "h-6 w-6 rounded-full border block border-marble-white"
                const nestedStyling = idx ? "ml-[-5px]" : ""
                if (idx === 3) {
                  const additionalContributors = (contributors?.length || 0) - 3
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
            : ""}
        </div>
        {isAcceptingApplications && (
          <div className="flex-auto grid place-content-end">
            <span className="text-neon-blue text-xs">OPEN FOR SUBMISSIONS</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default InitiativeCard
