import { useRouter } from "next/router"
import { useParam, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Field } from "react-final-form"
import {
  composeValidators,
  mustBeAboveNumWords,
  requiredField,
  mustOmitLongWords,
} from "app/utils/validators"
import TextLink from "app/core/components/TextLink"
import { LINKS } from "app/core/utils/constants"
import { getClientAddress, getFieldValue, getMinNumWords } from "app/template/utils"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import getTemplateById from "app/template/queries/getTemplateById"
import getRfpById from "app/rfp/queries/getRfpById"

export const FoxesProposeFirstStep = () => {
  const templateId = useParam("templateId") as string
  const { rfpId } = useRouter().query
  const router = useRouter()
  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId as string,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (!data) {
          router.push(Routes.Page404())
        }
      },
      onError: (data) => {
        if (!data) {
          router.push(Routes.Page404())
        }
      },
    }
  )
  const [template] = useQuery(
    getTemplateById,
    {
      id: templateId as string,
    },
    {
      enabled: !!templateId,
      suspense: false,
      refetchOnWindowFocus: false,
    }
  )

  const { text: displayAddress } = useDisplayAddress(getClientAddress(template?.data?.fields))

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
        {getMinNumWords(template?.data.fields) > 0
          ? `${getMinNumWords(template?.data.fields)} words minimum.`
          : ""}{" "}
        Supports <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown syntax</TextLink>.
      </span>
      <Field
        name="body"
        component="textarea"
        validate={composeValidators(
          requiredField,
          mustOmitLongWords(50),
          mustBeAboveNumWords(getMinNumWords(template?.data.fields))
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
