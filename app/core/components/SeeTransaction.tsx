import { ExternalLinkIcon } from "@heroicons/react/solid"
import networks from "app/utils/networks.json"

export const SeeTransaction = ({ className = "", chainId = 1, txnHash }) => {
  return (
    <a
      className={`flex flex-row space-x-1 items-center cursor-pointer text-electric-violet ${className}`}
      href={`${networks[chainId].explorer}/tx/${txnHash}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <p>See transaction</p>
      <ExternalLinkIcon className="h-4 w-4" />
    </a>
  )
}

export default SeeTransaction
