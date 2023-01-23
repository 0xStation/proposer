import { Field } from "react-final-form"
import { Token } from "app/token/types"
import { formatTokenAmount } from "app/utils/formatters"
import { composeValidators, isValidTokenAmount, requiredField } from "app/utils/validators"

export const TokenAmountField = ({
  title,
  subtitle,
  fieldName,
  token,
}: {
  title: string
  subtitle?: string
  fieldName: string
  token: Token
}) => {
  return (
    <>
      <label className="font-bold block mt-6">{title}</label>
      {subtitle && <span className="text-xs text-concrete block">{subtitle}</span>}
      <Field
        name={fieldName}
        format={formatTokenAmount}
        validate={composeValidators(
          requiredField,
          // isPositiveAmount,
          isValidTokenAmount(token?.decimals || 0)
        )}
        disabled={false}
      >
        {({ input, meta }) => {
          return (
            <>
              <input
                {...input}
                type="text"
                className="w-full bg-wet-concrete rounded mt-1 p-2"
                placeholder="0.00"
              />
              {meta.touched && meta.error && (
                <span className="text-torch-red text-xs">{meta.error}</span>
              )}
            </>
          )
        }}
      </Field>
    </>
  )
}
