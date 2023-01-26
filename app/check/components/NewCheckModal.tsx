import Modal from "app/core/components/Modal"
import { RadioGroup } from "@headlessui/react"
import { useEffect, useState } from "react"
import { classNames } from "app/core/utils/classNames"
import { NewCheckFungibleForm } from "./NewCheckFungibleForm"
import { NewCheckNonFungibleForm } from "./NewCheckNonFungibleForm"
import { invalidateQuery } from "@blitzjs/rpc"
import getChecks from "../queries/getChecks"
import getSchedules from "app/schedule/queries/getSchedules"

export const NewCheckModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (open) => void
}) => {
  const [selection, setSelection] = useState<string | null>()

  // when closing modal, reset selection for next open
  useEffect(() => {
    if (!isOpen) {
      setSelection(null)
    }
  })

  const Option = ({ value, title, subtitle, disabled = false }) => {
    return (
      <RadioGroup.Option value={value} disabled={disabled}>
        {({ checked, disabled }) => (
          <>
            <div
              className={classNames(
                checked ? "border-marble-white" : "border-wet-concrete ",
                disabled ? "cursor-not-allowed" : "hover:bg-charcoal cursor-pointer",
                "flex flex-col space-y-1 justify relative flex rounded-lg border p-4"
              )}
            >
              <h4 className="text-lg font-bold">{title}</h4>
              <div className="text-concrete text-xs">{subtitle}</div>
            </div>
          </>
        )}
      </RadioGroup.Option>
    )
  }

  enum OptionValue {
    FT = "fungible token",
    NFT = "non-fungible token",
    GOV = "governance",
    CUSTOM = "custom contract",
  }

  const options = [
    {
      value: OptionValue.FT,
      title: "Transfer fungible tokens (ETH or ERC20)",
      subtitle: "For now, one kind of token can be sent per check",
      disabled: false,
    },
    {
      value: OptionValue.NFT,
      title: "Transfer non-fungible tokens (ERC721)",
      subtitle: "For now, one token can be sent per check",
      disabled: false,
    },
    {
      value: OptionValue.GOV,
      title: "Edit signers and quorum",
      subtitle: "Coming soon",
      disabled: true,
    },
    {
      value: OptionValue.CUSTOM,
      title: "Custom contract calls",
      subtitle: "Coming soon",
      disabled: true,
    },
  ]

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-6 mt-4">
        {!selection && (
          <RadioGroup value={selection} onChange={setSelection}>
            {/* TITLE */}
            <RadioGroup.Label className="text-2xl font-bold text-marble-white">
              What kind of Check do you want to create?
            </RadioGroup.Label>
            {/* OPTIONS */}
            <div className="mt-8 space-y-2">
              {options.map((option, idx) => {
                return (
                  <Option
                    key={idx}
                    value={option.value}
                    title={option.title}
                    subtitle={option.subtitle}
                    disabled={option.disabled}
                  />
                )
              })}
            </div>
          </RadioGroup>
        )}
        {selection === OptionValue.FT && (
          <NewCheckFungibleForm
            goBack={() => setSelection(null)}
            onCreate={() => {
              setIsOpen(false)
              invalidateQuery(getChecks)
              invalidateQuery(getSchedules)
            }}
          />
        )}

        {selection === OptionValue.NFT && (
          <NewCheckNonFungibleForm
            goBack={() => setSelection(null)}
            onCreate={() => {
              setIsOpen(false)
              invalidateQuery(getChecks)
            }}
          />
        )}
      </div>
    </Modal>
  )
}

export default NewCheckModal
