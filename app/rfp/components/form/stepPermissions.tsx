import { useEffect, useState } from "react"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"
import TextLink from "app/core/components/TextLink"
import { LINKS, RfpFormStep } from "app/core/utils/constants"
import { composeValidators, isValidTokenAmount, requiredField } from "app/utils/validators"
import { Field } from "react-final-form"
import Preview from "app/core/components/MarkdownPreview"
import { formatTokenAmount } from "app/utils/formatters"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { useSession } from "@blitzjs/auth"
import useStore from "app/core/hooks/useStore"
import useHasMounted from "app/core/hooks/useHasMounted"
import ImportTokenModal from "app/core/components/ImportTokenModal"

export const RfpFormStepPermission = ({
  tokenOptions,
  selectedSubmissionToken,
  setSelectedSubmissionToken,
  isImportTokenModalOpen,
  setIsImportTokenModalOpen,
  setProposalStep,
  chainId,
  refetchTokens,
}) => {
  const session = useSession({ suspense: false })
  const activeUser = useStore((state) => state.activeUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const { hasMounted } = useHasMounted()

  useEffect(() => {
    // if user's wallet isn't connected redirect back to the first step
    // the reward form relies on the active chain to determine which tokens
    // to pull from
    if (hasMounted && (!activeUser?.address || !session?.siwe?.address)) {
      setProposalStep(RfpFormStep.GENERAL)
    }
  }, [activeUser?.address, session?.siwe?.address, hasMounted])

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
      {/* <span className="text-xs text-concrete block"></span> */}
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
                    const selectedSubmissionToken = tokenOptions.find((token) =>
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
                  {tokenOptions?.map((token) => {
                    return (
                      <option key={token?.address} value={token?.address}>
                        {token?.symbol}
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
      <div className="flex flex-row justify-between">
        <span className="text-xs text-concrete block">
          {" "}
          Don&apos;t see your token? Import an ERC-20 with its address.
        </span>
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
          {/* <span className="text-xs text-concrete block"></span> */}
          <Field
            name="submissionTokenMinBalance"
            format={formatTokenAmount}
            validate={composeValidators(requiredField, isValidTokenAmount)}
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