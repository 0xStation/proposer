import { BlitzApiHandler } from "blitz"

// fetch from [endpoint]/api/prototypes
const handler: BlitzApiHandler = (req, res) => {
  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  const payload = {
    name: "Station Contributor NFT",
    description: "Contributor NFT for a Station Terminal.",
    external_url: "https://station.express/",
    image: "https://pbs.twimg.com/profile_images/1465787628553310211/DOMgJi5d_400x400.jpg",
    attributes: [
      {
        trait_type: "Status",
        value: "Active",
      },
      {
        trait_type: "Role",
        value: "Staff",
      },
      {
        trait_type: "Initiative",
        value: "Contributor NFT",
      },
      {
        trait_type: "Initiative",
        value: "Waiting Room",
      },
      {
        trait_type: "Joined At",
        value: "1629286851",
        display_type: "date",
      },
      {
        trait_type: "Points",
        value: "900",
      },
      {
        trait_type: "Last Contributed",
        value: "1629286851",
        display_type: "date",
      },
      {
        trait_type: "Guild",
        value: "Protocol",
      },
      {
        trait_type: "Guild",
        value: "Backend",
      },
      {
        trait_type: "Guild",
        value: "Product",
      },
    ],
  }
  res.end(JSON.stringify(payload))
}
export default handler
