// PACKAGE
import { useSession } from "@blitzjs/auth"
import { TokenType } from "@prisma/client"
import { Field } from "react-final-form"
// CORE
import ImportTokenModal from "app/core/components/ImportTokenModal"
import WhenFieldChanges from "app/core/components/WhenFieldChanges"
import useStore from "app/core/hooks/useStore"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { getNetworkName } from "app/core/utils/networkInfo"
import {
  composeValidators,
  isPositiveAmount,
  isValidTokenAmount,
  requiredField,
} from "app/utils/validators"
import { formatPositiveInt, formatTokenAmount } from "app/utils/formatters"

export const RfpFormStepPermission = ({
  permissionTokenOptions,
  selectedSubmissionToken,
  setSelectedSubmissionToken,
  isImportTokenModalOpen,
  setIsImportTokenModalOpen,
  chainId,
  refetchTokens,
}) => {
  const session = useSession({ suspense: false })
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)

  return (
    <>
      <ImportTokenModal
        isOpen={isImportTokenModalOpen}
        setIsOpen={setIsImportTokenModalOpen}
        chainId={chainId?.toString()}
        // refetches the tokens in the new proposal form token dropdown
        callback={() => refetchTokens(true)}
      />
      {/* SUBMISSION TOKEN */}
      <label className="font-bold block mt-6">Token-gating on proposal submissions*</label>
      <span className="text-xs text-concrete block">
        Select from ERC-20 or ERC-721 tokens on the{" "}
        <span className="font-bold">{getNetworkName(chainId).toUpperCase()}</span> network.
      </span>
      <Field name="submissionTokenAddress">
        {({ input, meta }) => {
          return (
            <>
              <div className="custom-select-wrapper">
                <select
                  // if network is selected make the token address field required.
                  required
                  {...input}
                  className="w-full bg-wet-concrete rounded p-2 mt-1"
                  value={selectedSubmissionToken?.address as string}
                  onChange={(e) => {
                    const selectedSubmissionToken = permissionTokenOptions.find((token) =>
                      addressesAreEqual(token.address, e.target.value)
                    )
                    setSelectedSubmissionToken(selectedSubmissionToken)
                    // custom values can be compatible with react-final-form by calling
                    // the props.input.onChange callback
                    // https://final-form.org/docs/react-final-form/api/Field
                    input.onChange(selectedSubmissionToken?.address)
                  }}
                >
                  <option value="">None</option>
                  {permissionTokenOptions?.map((token) => {
                    return (
                      <option key={token?.address} value={token?.address}>
                        {`${token?.symbol} - ${token?.name} (${token?.type})`}
                      </option>
                    )
                  })}
                </select>
              </div>
              {meta.touched && meta.error && (
                <span className="text-torch-red text-xs">{meta.error}</span>
              )}
            </>
          )
        }}
      </Field>
      <div className="flex flex-row justify-end">
        <button
          className="text-electric-violet cursor-pointer flex justify-start"
          onClick={(e) => {
            e.preventDefault()
            return !session.siwe?.address
              ? toggleWalletModal(true)
              : setIsImportTokenModalOpen(true)
          }}
        >
          + Import
        </button>
      </div>
      {!!selectedSubmissionToken && (
        <>
          {/* MINIMUM BALANCE */}
          <label className="font-bold block mt-6">Minimum balance*</label>
          <WhenFieldChanges
            // when changing tokens, reset minimum balance value
            field="submissionTokenAddress"
            set="submissionTokenMinBalance"
            to={""}
          />
          <Field
            name="submissionTokenMinBalance"
            format={
              selectedSubmissionToken.type === TokenType.ERC721
                ? formatPositiveInt // 721 has no decimals so all balances are integers
                : formatTokenAmount // other token amounts support decimals
            }
            validate={composeValidators(
              requiredField,
              isValidTokenAmount(selectedSubmissionToken?.decimals || 0),
              isPositiveAmount
            )}
          >
            {({ input, meta }) => {
              return (
                <div className="h-10 mt-1 w-full bg-wet-concrete text-marble-white mb-5 rounded">
                  <input
                    {...input}
                    type="text"
                    placeholder="0"
                    className="h-full p-2 inline w-[80%] sm:w-[90%] bg-wet-concrete text-marble-white"
                  />
                  {meta.error && meta.touched && (
                    <span className="text-xs text-torch-red mt-2 block">{meta.error}</span>
                  )}
                </div>
              )
            }}
          </Field>
        </>
      )}
    </>
  )
}

export default RfpFormStepPermission
