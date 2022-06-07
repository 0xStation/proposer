/**
 * Fetches guild members for a Discord server
 * Discord imposes a limit of querying 1000 members at a time,
 * so we have this recursive algorithm to keep fetching until we have
 * all members and return them as one list
 */
export const getGuildMembers = async (guildId) => {
  const paginatedFetch = async (after, previousResults) => {
    const limit = 1000
    const baseURL = `${process.env.BLITZ_PUBLIC_API_ENDPOINT}/guilds/${guildId}/members?limit=${limit}`
    const url = after ? baseURL + `&after=${after}` : baseURL
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
    })
    const newResults = await response.json()

    if (newResults.code !== undefined) {
      throw newResults.message
    }

    const results = [...previousResults, ...newResults]

    // limit is 1000
    // 1. there are more results to fetch
    // 2. we fetched the last 1000, but no way to know
    // so we need to make another request to check
    // to request the next page, get the id of the last user in current page to specify as "after"
    if (newResults.length === limit) {
      return paginatedFetch(newResults[limit - 1].user.id, results)
    }

    // anything less than 1000 means this was final page, return results
    return results
  }

  return await paginatedFetch(null, [])
}
