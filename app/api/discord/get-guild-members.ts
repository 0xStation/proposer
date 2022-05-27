export default async function handler(req, res) {
  const paginatedFetch = async (after, previousResults) => {
    const limit = 1000
    const baseURL = `${process.env.BLITZ_PUBLIC_API_ENDPOINT}/guilds/${req.body.guild_id}/members?limit=${limit}`
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
    if (newResults.length === 1000) {
      return paginatedFetch(newResults[999].user.id, results)
    }

    // anything less than 1000 means this was final page, return results
    return results
  }

  try {
    const guildMembers = await paginatedFetch(null, [])
    res.status(200).json({ guildMembers })
    return
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: err })
  }
}
