import { Account } from "app/account/types"
import { Link, RouteUrlObject, useRouter } from "blitz"
import { genPathFromUrlObject } from "app/utils/genPathFromUrlObject"
import { getInitiativeStatusColor } from "app/utils/initiativeStatusOptions"

type InitiatveCardProps = {
  title: string
  oneLiner: string
  contributors: Account[] | undefined
  isAcceptingApplications: boolean
  editable: boolean
  status: string
  viewLink: RouteUrlObject
  editLink: RouteUrlObject
}

const InitiativeCard = ({
  title,
  oneLiner,
  contributors,
  status,
  editable,
  viewLink,
  editLink,
}: InitiatveCardProps) => {
  const router = useRouter()
  const buttonStyles =
    "bg-tunnel-black text-magic-mint border border-magic-mint hover:bg-wet-concrete rounded w-36 p-1"

  const cardJSX = (
    <div
      onClick={() => router.push(genPathFromUrlObject(viewLink))}
      className="border border-concrete p-4 flex flex-col cursor-pointer h-full hover:border-marble-white relative group"
    >
      {editable && (
        <>
          <div className="absolute h-full w-full bg-tunnel-black opacity-80 top-0 left-0 hidden group-hover:block"></div>
          <div className="absolute h-full w-full top-0 left-0 flex-col items-center justify-center space-y-2 hidden group-hover:flex">
            <Link href={viewLink}>
              <button className={buttonStyles}>View</button>
            </Link>
            <button
              className={buttonStyles}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const path = genPathFromUrlObject(viewLink)
                navigator.clipboard.writeText(path).then(() => {
                  alert("copied to clipboard")
                })
              }}
            >
              Share
            </button>
            <button
              className={buttonStyles}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(genPathFromUrlObject(editLink))
              }}
            >
              Edit
            </button>
          </div>
        </>
      )}
      <div className="flex flex-row items-center">
        <span
          className={`h-2 w-2 block rounded-full mr-2 bg-${getInitiativeStatusColor(status)}`}
        />
        <span className="text-center text-marble-white uppercase text-xs tracking-wide">
          {status}
        </span>
      </div>
      <h3 className="text-marble-white text-2xl mt-2">{title}</h3>
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
      </div>
    </div>
  )

  if (editable) {
    return cardJSX
  }

  return <Link href={viewLink}>{cardJSX}</Link>
}

export default InitiativeCard
