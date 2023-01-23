import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { MerkleTree } from "merkletreejs"
import { hexlify } from "@ethersproject/bytes"
import useSignature from "app/core/hooks/useSignature"
import useStore from "app/core/hooks/useStore"
import getChecks from "../queries/getChecks"
import { genCheckDigest } from "../signature"
import { genTreeDigest } from "../treeSignature"
import signCheck from "app/checkSignature/mutations/signCheck"
import { getHash } from "app/signatures/utils"
import batchSignCheck from "app/checkSignature/mutations/batchSignChecks"
import { BigNumber } from "ethers"
import { keccak256 } from "@ethersproject/keccak256"

export const useSignCheck = ({ checks, setIsLoading }) => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const { signMessage } = useSignature()
  const [signCheckMutation] = useMutation(signCheck)
  const [batchSignChecksMutation] = useMutation(batchSignCheck)

  const initiateSignature = async () => {
    try {
      const checkMessages = checks?.map((check) => genCheckDigest(check))
      const leaves = checkMessages
        ?.map((checkMessage) =>
          getHash(checkMessage.domain, checkMessage.types, checkMessage.value)
        )
        .sort((a, b) => {
          const leafA = BigNumber.from(a)
          const leafB = BigNumber.from(b)

          return leafA.gt(leafB) ? 1 : -1
        }) // sort to guarantee ordering
      const tree = new MerkleTree(leaves, keccak256)
      const root = tree.getRoot()
      const treeMessage = genTreeDigest(hexlify(root))
      const signature = await signMessage(treeMessage)

      // no signature - user must have denied signature
      if (!signature) {
        setIsLoading(false)
        return false
      }
      try {
        if (checks?.length <= 1) {
          await signCheckMutation({
            signerAddress: activeUser!.address!,
            message: treeMessage,
            signature,
            checkId: checks[0].id,
            // `hexlify` converts a uint8 array into a hex string
            // using `toString` on root leaves char sequences that
            // postgres is unable to store
            // `arrayify` converts the hexstring back to a uint8
            root: hexlify(root),
            path: tree.getProof(leaves[0]).map((leaf) => hexlify(leaf.data)),
          })
        } else {
          await batchSignChecksMutation({
            signerAddress: activeUser!.address!,
            message: treeMessage,
            signature,
            root: hexlify(root),
            checkIdAndPath: checks.map((check) => {
              const message = genCheckDigest(check)
              return {
                checkId: check.id,
                path: tree
                  .getProof(getHash(message.domain, message.types, message.value))
                  .map((leaf) => hexlify(leaf.data)),
              }
            }),
          })
        }

        invalidateQuery(getChecks)
        setToastState({
          isToastShowing: true,
          type: "success",
          message: "Your signature has been saved.",
        })
        return true
      } catch (e) {
        console.error(e)
      }
      setIsLoading(false)
      return false
    } catch (e) {
      setIsLoading(false)
      console.error(e)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: e.message,
      })
      return false
    }
    return false
  }

  return { signCheck: initiateSignature }
}
