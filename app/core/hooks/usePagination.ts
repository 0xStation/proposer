interface PaginationResults {
  results: any[]
  hasNext: boolean
  hasPrev: boolean
  totalPages: number
  totalResults: number
}

// basic hook for reusing client side "pagination"
const usePagination = (data: any, page: number, per_page: number): PaginationResults => {
  if (!data) {
    return {
      results: [],
      totalResults: 0,
      hasPrev: false,
      hasNext: false,
      totalPages: 0,
    }
  }

  const totalResults = data.length
  const start = page * per_page
  const end = start + per_page
  const results = data.slice(start, end)

  return {
    results,
    totalResults,
    hasPrev: page > 0,
    hasNext: start + per_page < totalResults,
    totalPages: Math.ceil(totalResults / per_page),
  }
}

export default usePagination
