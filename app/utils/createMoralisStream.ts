import { getMoralisNetwork } from "app/core/utils/networkInfo"
import { EvmChain } from "@moralisweb3/evm-utils"
import Moralis from "moralis"

export const createMoralisStream = async (proposal, chainIds, clientAddresses) => {
  Moralis.start({
    apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
  })

  const EvmChains = chainIds.map((chainId) => {
    return getMoralisNetwork(chainId) as EvmChain
  })

  const stream = {
    chains: EvmChains,
    description: `Station proposal ${proposal.id}`,
    tag: "Gnosis, Station, Proposal",
    webhookUrl: process.env.NEXT_PUBLIC_MORALIS_WEBHOOK_URL || "",
    includeNativeTxs: true,
    includeInternalTxs: true,
    includeContractLogs: true,
  }

  const createdStream = await Moralis.Streams.add(stream)
  const { id } = createdStream.toJSON()
  await Moralis.Streams.addAddress({ address: clientAddresses, id })

  return true
}
