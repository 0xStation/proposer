import { Dispatch, SetStateAction } from "react"
import BackArrow from "../icons/BackArrow"
import ForwardArrow from "../icons/ForwardArrow"
import { PAGINATION_TAKE } from "../utils/constants"

export const Pagination = ({
  page,
  setPage,
  results,
  resultsCount,
  resultsLabel,
  className = "",
}: {
  page: number
  setPage: Dispatch<SetStateAction<number>>
  results: any[]
  resultsCount: number
  resultsLabel: string
  className?: string
}) => {
  return (
    <div className={className}>
      Showing
      <span className="text-electric-violet font-bold">
        {" "}
        {resultsCount === 0 ? 0 : page * PAGINATION_TAKE + 1}{" "}
      </span>
      to
      <span className="text-electric-violet font-bold">
        {" "}
        {(page + 1) * PAGINATION_TAKE > resultsCount!
          ? results?.length
          : (page + 1) * PAGINATION_TAKE}{" "}
      </span>
      of
      <span className="font-bold"> {resultsCount} </span>
      {resultsLabel}
      <button className="w-6 ml-2" disabled={page === 0} onClick={() => setPage(page - 1)}>
        <BackArrow className={`${page === 0 ? "fill-concrete" : "fill-marble-white"}`} />
      </button>
      <button disabled={results?.length! < PAGINATION_TAKE} onClick={() => setPage(page + 1)}>
        <ForwardArrow
          className={`${
            results?.length! < PAGINATION_TAKE ? "fill-concrete" : "fill-marble-white"
          }`}
        />
      </button>
    </div>
  )
}

export default Pagination
