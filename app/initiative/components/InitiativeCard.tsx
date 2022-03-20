import { Account } from "app/account/types"
import { Link, RouteUrlObject } from "blitz"

type InitiatveCardProps = {
  title: string
  oneLiner: string
  contributors: Account[] | undefined
  isAcceptingApplications: boolean
  editable: boolean
  viewLink: RouteUrlObject
  editLink: RouteUrlObject
}

const InitiativeCard = ({
  title,
  oneLiner,
  contributors,
  isAcceptingApplications,
  editable,
  viewLink,
  editLink,
}: InitiatveCardProps) => {
  const buttonStyles =
    "bg-tunnel-black text-magic-mint hover:text-marble-white border border-magic-mint hover:border-marble-white rounded w-24"

  const cardJSX = (
    <div className="border border-concrete p-4 flex flex-col cursor-pointer h-full hover:border-marble-white relative group">
      {editable && (
        <>
          <div className="absolute h-full w-full bg-tunnel-black opacity-80 top-0 left-0 hidden group-hover:block"></div>
          <div className="absolute h-full w-full top-0 left-0 flex-col items-center justify-center space-y-2 hidden group-hover:flex">
            <Link href={viewLink}>
              <button className={buttonStyles}>View</button>
            </Link>
            {/* link like that gets copied is being weird so I'm going to comment out */}
            {/* doesnt seem as important anyway, plus, why can only staff share a link? */}
            {/* <button
              className={buttonStyles}
              onClick={() => {
                navigator.clipboard.writeText(viewLink.pathname).then(() => {
                  alert("copied to clipboard")
                })
              }}
            >
              Share
            </button> */}
            <Link href={editLink}>
              <button className={buttonStyles}>Edit</button>
            </Link>
          </div>
        </>
      )}
      <div>
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
                    <span
                      key={idx}
                      className={`bg-gradient-to-b object-cover from-electric-violet to-magic-mint ${pfpStyling} ${nestedStyling}`}
                    ></span>
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
    </div>
  )

  if (editable) {
    return cardJSX
  }

  return <Link href={editLink}>{cardJSX}</Link>
}

export default InitiativeCard
