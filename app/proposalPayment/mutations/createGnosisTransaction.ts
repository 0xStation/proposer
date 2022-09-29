import * as z from "zod"
import networks from "app/utils/networks.json"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

const CreateGnosisSignature = z.object({
  senderAddress: z.string(),
  sendTo: z.string(),
  sendAmount: z.number(),
  safeAddress: z.string(),
  chainId: z.number(),
  txHash: z.string().optional(),
  signature: z.string().optional(),
})

export default async function createGnosisSignature(input: z.infer<typeof CreateGnosisSignature>) {
  const params = CreateGnosisSignature.parse(input)

  // info request -- need to send a failing tx in order to get "real" data
  // docs.gnosis-safe.io/tutorials/tutorial_tx_service_initiate_sign
  let gnosisInfoRequestParams = {
    to: toChecksumAddress(params.sendTo),
    value: params.sendAmount * 10e18, // Value in wei
    operation: 0,
    safeTxGas: 0,
    baseGas: 0,
    gasPrice: 0,
    nonce: 0,
    contractTransactionHash: params.txHash
      ? params.txHash
      : "0xd112233445566778899aabbccddff00000000000000000000000000000000000", // fake contract hash -- the response will return a real hash
    sender: toChecksumAddress(params.senderAddress), // Owner of the Safe proposing the transaction. Must match one of the signatures
    signature: params.signature
      ? params.signature
      : "0x000000000000000000000000a935484ba4250c446779d4703f1598dc2ea00d12000000000000000000000000000000000000000000000000000000000000000001", // fake signature -- the response will return a real signature
    origin: "Station proposal", // Give more information about the transaction, e.g. "My Custom Safe app"
  }

  const network = networks[params.chainId]?.gnosisNetwork
  if (!network) {
    throw Error("chainId not available on Gnosis")
  }
  const url = `https://safe-transaction.${network}.gnosis.io/api/v1/safes/${toChecksumAddress(
    params.safeAddress
  )}/multisig-transactions/`

  let response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gnosisInfoRequestParams),
    })
  } catch (err) {
    console.error(err)
    return null
  }

  if (response.status === 404) {
    return null
  }

  const results = await response.json()
  console.log(results)

  /**
   * starts off looking like this
   * Contract-transaction-hash=0x676df0dcb6e4b282cdeb007214bcc4ad8ba924da2344ddbef9c0e56363784392 does not match provided contract-tx-hash=0xd112233445566778899aabbccddff00000000000000000000000000000000000
   *
   * split on first space to get
   * Contract-transaction-hash=0x676df0dcb6e4b282cdeb007214bcc4ad8ba924da2344ddbef9c0e56363784392
   *
   * split on = to get hash
   */
  if (results.nonFieldErrors) {
    const contractTxHash = results.nonFieldErrors[0].split(" ")[0].split("=")[1]
    return contractTxHash
  }

  return results
}
