import { Field } from "react-final-form"
import { useQuery, useParam } from "blitz"
import {
  composeValidators,
  mustBeAboveNumWords,
  requiredField,
  mustOmitLongWords,
} from "app/utils/validators"
import TextLink from "app/core/components/TextLink"
import { LINKS } from "app/core/utils/constants"
import { getClientAddress } from "app/template/utils"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import getRfpByTemplateId from "app/rfp/queries/getRfpByTemplateId"

export const FoxesProposeFirstStep = ({ minNumWords }) => {
  const templateId = useParam("templateId") as string
  const [rfp] = useQuery(
    getRfpByTemplateId,
    {
      templateId: templateId,
    },
    {
      enabled: !!templateId,
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
        validate={composeValidators(
          requiredField,
          mustOmitLongWords(50),
          mustBeAboveNumWords(minNumWords)
        )}
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
