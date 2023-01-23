import { Check, CheckStatus } from "../types"
import useCheckStatus from "../hooks/useCheckStatus"
import { useState } from "react"
import { Field } from "react-final-form"
import { OnChange } from "react-final-form-listeners"

export const SignatureCheckbox = ({ check, className }: { check: Check; className?: string }) => {
  const { status } = useCheckStatus({ check })
  const [isChecked, setIsChecked] = useState(false)

  return (
    <>
      <Field
        key={check.id}
        className={`${
          isChecked
            ? "visible"
            : status === CheckStatus.PENDING
            ? "group:visible invisible"
            : "invisible"
        }`}
        type="checkbox"
        name={`${check.id}`}
        initialValue={false}
        render={({ input, meta }) => {
          return (
            <div
              className={`${className} custom-checkbox-container relative inline-block cursor-pointer border border-marble-white p-0.5 ${
                isChecked
                  ? "visible"
                  : status === CheckStatus.PENDING
                  ? "group-hover:visible invisible"
                  : "invisible"
              }`}
            >
              <input
                {...input}
                value={[]}
                className={"custom-checkbox opacity-0 absolute cursor-pointer"}
                type="checkbox"
              />
              <span className="custom-checkbox-placeholder h-3 w-3 block bg-tunnel-black" />
            </div>
          )
        }}
      />
      <OnChange name={`${check.id}`}>
        {(value) => {
          setIsChecked(!isChecked)
        }}
      </OnChange>
    </>
  )
}
