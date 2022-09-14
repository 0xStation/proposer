import { ExternalLinkIcon } from "@heroicons/react/solid"
import networks from "app/utils/networks.json"

export const AddressLink = ({
  className = "",
  chainId = 1,
  address,
  children,
}: {
  className?: string
  chainId?: number
  address: string
  children?: any
}) => {
  return (
    <a
      className={className}
      href={`${networks[chainId].explorer}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ExternalLinkIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer inline" />
    </a>
  )
}

export default AddressLink
