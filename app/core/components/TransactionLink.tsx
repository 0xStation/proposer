import { ExternalLinkIcon } from "@heroicons/react/solid"
import networks from "app/utils/networks.json"

export const TransactionLink = ({ className = "", chainId = 1, txnHash }) => {
  return (
    <a
      className={className}
      href={`${networks[chainId].explorer}/tx/${txnHash}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ExternalLinkIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
    </a>
  )
}

export default TransactionLink
