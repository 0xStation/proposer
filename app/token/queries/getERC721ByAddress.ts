import { Ctx } from "blitz"
import { z } from "zod"
import { GraphQLClient } from "graphql-request"
import gql from "graphql-tag"

const GetERC721ByAddress = z.object({
  address: z.string().optional(),
  chainId: z.number().optional(),
})

export const ALL_NFTS_QUERY = gql`
  query ownerNFTs($ownerAddresses: [String!], $chain: Chain!) {
    tokens(
      where: { ownerAddresses: $ownerAddresses }
      networks: { network: ETHEREUM, chain: $chain }
    ) {
      nodes {
        token {
          collectionName
          collectionAddress
          tokenId
          tokenStandard
          name
          image {
            url
          }
        }
      }
    }
  }
`

export async function getERC721ByAddress(input: z.infer<typeof GetERC721ByAddress>, ctx: Ctx) {
  const params = GetERC721ByAddress.parse(input)
  const { chainId, address } = params

  try {
    const graphlQLClient = new GraphQLClient("https://api.zora.co/graphql", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    })

    const response = await graphlQLClient.request(ALL_NFTS_QUERY, {
      ownerAddresses: [address],
      chain: chainId === 5 ? "GOERLI" : "MAINNET", // goerli if set or default to mainnet
    })

    return response.tokens.nodes
  } catch (err) {
    console.error("Failure fetching accountTokens", err)
    throw Error(err)
  }
}

export default getERC721ByAddress
