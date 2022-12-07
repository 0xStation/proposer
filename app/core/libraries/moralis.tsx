import Moralis from "moralis"
import { EvmChain } from "@moralisweb3/common-evm-utils"

Moralis.start({
  apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
})

export const createMoralisStream = async (
  proposalId: string,
  evmChain: EvmChain,
  clientAddress: string
) => {
  const stream = {
    chains: [evmChain],
    description: `Station proposal ${proposalId}`,
    tag: "Gnosis, Station, Proposal",
    webhookUrl: process.env.NEXT_PUBLIC_MORALIS_WEBHOOK_URL || "",
    includeNativeTxs: true,
    includeInternalTxs: true,
    includeContractLogs: true,
  }

  const createdStream = await Moralis.Streams.add(stream)
  const { id } = createdStream.toJSON()
  await Moralis.Streams.addAddress({ address: clientAddress, id })

  return id
}

const moralisChainMap: Record<string, EvmChain> = {
  "1": EvmChain.ETHEREUM,
  "5": EvmChain.GOERLI,
  "137": EvmChain.POLYGON,
  "80001": EvmChain.MUMBAI,
  "43114": EvmChain.AVALANCHE,
}

export const getMoralisNetwork = (chainId: number) => {
  return moralisChainMap[chainId.toString()] || EvmChain.ETHEREUM
}
