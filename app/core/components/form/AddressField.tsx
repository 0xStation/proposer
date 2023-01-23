import { composeValidators, isEnsOrAddress, requiredField } from "app/utils/validators"
import { Field } from "react-final-form"
import debounce from "lodash.debounce"
import useEnsInput from "app/proposalForm/hooks/useEnsInput"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import { EnsAddressMetadataText } from "app/proposalForm/components/EnsAddressMetadataText"

export const AddressField = ({
  title,
  subtitle,
  fieldName,
}: {
  title: string
  subtitle?: string
  fieldName: string
}) => {
  const { setAddressInputVal: setClientAddressInputVal, ensAddressResult: clientEnsAddressResult } =
    useEnsInput()

  const handleEnsAddressInputValOnKeyUp = (val, setValToCheckEns) => {
    const fieldVal = val.trim()
    // if value is already an address, we don't need to check for ens
    if (ethersIsAddress(fieldVal)) return

    // set state input val to update ens address
    setValToCheckEns(fieldVal)
  }

  return (
    <>
      <label className="font-bold block mt-6">{title}</label>
      {subtitle && <span className="text-xs text-concrete block">{subtitle}</span>}
      <Field name={fieldName} validate={composeValidators(requiredField, isEnsOrAddress)}>
        {({ meta, input }) => {
          return (
            <>
              <input
                {...input}
                type="text"
                required
                placeholder="Enter ENS name or wallet address"
                className="bg-wet-concrete rounded mt-1 w-full p-2"
                onKeyUp={debounce(
                  (e) => handleEnsAddressInputValOnKeyUp(e.target.value, setClientAddressInputVal),
                  200
                )}
              />

              {meta.touched && meta.error && (
                <span className="text-torch-red text-xs">{meta.error}</span>
              )}
              {clientEnsAddressResult && (
                <EnsAddressMetadataText address={clientEnsAddressResult} />
              )}
            </>
          )
        }}
      </Field>
    </>
  )
}
