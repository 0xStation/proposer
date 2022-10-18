import { Field } from "react-final-form"
import debounce from "lodash.debounce"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import useEnsInput from "app/proposalForm/hooks/useEnsInput"
import {
  composeValidators,
  isEnsOrAddress,
  mustBeAboveNumWords,
  requiredField,
} from "app/utils/validators"
import { EnsAddressMetadataText } from "../EnsAddressMetadataText"
import TextLink from "app/core/components/TextLink"
import { LINKS } from "app/core/utils/constants"
import { useQuery, useRouterQuery } from "blitz"
import getRfpById from "app/rfp/queries/getRfpById"
import { getClientAddress } from "app/template/utils"
import { useEnsName } from "wagmi"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import { getNetworkExplorer } from "app/core/utils/networkInfo"

export const FoxesProposeFirstStep = ({ minNumWords }) => {
  const queryParams = useRouterQuery()
  const rfpId = queryParams?.rfpId as string
  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute in milliseconds
    }
  )

  const { text: displayAddress } = useDisplayAddress(getClientAddress(rfp?.data.template))

  return (
    <>
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">To</span>
        <span className="items-end">{"@" + displayAddress}</span>
      </div>
      {!!rfp?.data?.singleTokenGate && (
        <div className="mt-4 flex flex-row w-full items-center justify-between">
          <span className="font-bold">Token requirement</span>
          <div className="items-end">
            {`≥${rfp?.data?.singleTokenGate.minBalance || 1} `}
            <TextLink
              url={
                getNetworkExplorer(rfp?.data?.singleTokenGate.token.chainId) +
                "/token/" +
                rfp?.data?.singleTokenGate.token.address
              }
            >
              {rfp?.data?.singleTokenGate.token.name}
            </TextLink>
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Title</span>
        <span className="items-end">{`${rfp?.data.content.title || ""} submission`}</span>
      </div>
      {/* BODY */}
      <label className="font-bold block mt-6">Details*</label>
      <span className="text-xs text-concrete block">
        125 words min. Supports <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown syntax</TextLink>.
      </span>
      <Field
        name="body"
        component="textarea"
        validate={composeValidators(requiredField, mustBeAboveNumWords(minNumWords))}
      >
        {({ input, meta }) => (
          <div>
            <textarea
              {...input}
              rows={10}
              placeholder="Describe your ideas, detail the value you aim to deliver, and link any relevant documents."
              className="mt-1 bg-wet-concrete text-marble-white p-2 rounded min-h-[180px] w-full"
            />
            {/* this error shows up when the user focuses the field (meta.touched) */}
            {meta.error && meta.touched && (
              <span className=" text-xs text-torch-red block">{meta.error}</span>
            )}
          </div>
        )}
      </Field>
    </>
  )
}
