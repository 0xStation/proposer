import { ExternalLinkIcon } from "@heroicons/react/solid"
import networks from "app/utils/networks.json"

export const AddressLink = ({ className = "", chainId = 1, address }) => {
  return (
    <a
      className={className}
      href={`${networks[chainId].explorer}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ExternalLinkIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
    </a>
  )
}

export default AddressLink
