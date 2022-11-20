import { classNames } from "app/core/utils/classNames"
import { Switch } from "@headlessui/react"

export const BinarySwitch = ({ name, value, onChange }) => {
  return (
    <Switch
      name={name}
      checked={value}
      onChange={onChange}
      className={classNames(
        value ? "bg-marble-white" : "bg-wet-concrete",
        "relative inline-flex h-6 w-12 items-center rounded-full"
      )}
    >
      <span
        className={classNames(
          value ? "translate-x-6 bg-wet-concrete" : "translate-x-1 bg-concrete",
          "inline-block h-5 w-5 transform rounded-full transition"
        )}
      />
    </Switch>
  )
}

export default BinarySwitch
