import { Field } from "react-final-form"
import debounce from "lodash.debounce"
import { isAddress as ethersIsAddress } from "@ethersproject/address"
import useEnsInput from "app/proposalForm/hooks/useEnsInput"
import { composeValidators, isEnsOrAddress, requiredField } from "app/utils/validators"
import { EnsAddressMetadataText } from "../EnsAddressMetadataText"
import TextLink from "app/core/components/TextLink"
import { LINKS } from "app/core/utils/constants"
import { useQuery, useRouterQuery } from "blitz"
import getRfpById from "app/rfp/queries/getRfpById"

export const FoxesProposeFirstStep = () => {
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
      onSuccess: () => {
        console.log("rfp fetched", rfp)
      },
      cacheTime: 60 * 1000, // 1 minute in milliseconds
    }
  )

  return (
    <>
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">To</span>
        <span className="items-end">@philosophicalfoxes.eth</span>
      </div>
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">RFP</span>
        <span className="items-end">{rfp?.data.content.title}</span>
      </div>
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Title</span>
        <span className="items-end">{`${rfp?.data.content.title} submission`}</span>
      </div>
      {/* BODY */}
      <label className="font-bold block mt-6">Details*</label>
      <span className="text-xs text-concrete block">
        Supports <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown syntax</TextLink>. Need inspirations?
        Check out <TextLink url={LINKS.PROPOSAL_TEMPLATE}>proposal templates</TextLink>.
      </span>
      <Field name="body" component="textarea" validate={requiredField}>
        {({ input, meta }) => (
          <div>
            <textarea
              {...input}
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
