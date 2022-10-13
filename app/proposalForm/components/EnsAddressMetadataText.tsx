import AddressLink from "app/core/components/AddressLink"

export const EnsAddressMetadataText = ({ address }) => {
  return (
    <span className="text-xs text-concrete mt-1">
      ENS Address is{" "}
      <AddressLink className="inline" address={address}>
        {address}
      </AddressLink>
    </span>
  )
}
