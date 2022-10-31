import { useState } from "react"
import { Field } from "react-final-form"
import DiscordIcon from "/public/discord-icon.svg"
import { useQuery } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
import Image from "next/image"
import { composeValidators, mustBeAboveNumWords, requiredField } from "app/utils/validators"
import TextLink from "app/core/components/TextLink"
import { LINKS } from "app/core/utils/constants"
import { getClientAddress, getMinNumWords } from "app/template/utils"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import getTemplateById from "app/template/queries/getTemplateById"
import getRfpById from "app/rfp/queries/getRfpById"
import Preview from "app/core/components/MarkdownPreview"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"
import ConnectDiscordModal from "app/core/components/ConnectDiscordModal"
import useStore from "app/core/hooks/useStore"

export const FoxesFormStepPropose = ({ formState }) => {
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState<boolean>(false)
  const activeUser = useStore((state) => state.activeUser)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
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
      {!activeUser?.discordId && (
        <ConnectDiscordModal isOpen={isDiscordModalOpen} setIsOpen={setIsDiscordModalOpen} />
      )}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">To</span>
        <span className="items-end">{"@" + displayAddress}</span>
      </div>
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">Title</span>
        <span className="items-end">{`"${rfp?.data.content.title || ""}" submission`}</span>
      </div>
      {/* BODY */}
      <div className="flex flex-row justify-between">
        <div className="flex-col">
          <label className="font-bold block mt-6">Details*</label>
          <span className="text-xs text-concrete block">
            {getMinNumWords(template?.data.fields) > 0
              ? `${getMinNumWords(template?.data.fields)} words minimum.`
              : ""}{" "}
            Supports <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown syntax</TextLink>.
          </span>
        </div>
        <button
          type="button"
          className="pt-1"
          onClick={(e) => {
            e.preventDefault()
            setPreviewMode(!previewMode)
          }}
        >
          {previewMode ? (
            <>
              <p className="inline text-sm text-concrete">Edit</p>{" "}
              <EyeOffIcon className="inline h-5 w-5 fill-concrete" />
            </>
          ) : (
            <>
              <p className="inline text-sm text-concrete">Read</p>{" "}
              <EyeIcon className="inline h-5 w-5 fill-concrete" />
            </>
          )}
        </button>
      </div>
      {previewMode ? (
        <div className={`mt-1 bg-wet-concrete text-marble-white p-2 rounded w-full `}>
          <Preview markdown={formState.values.body} />
        </div>
      ) : (
        <Field
          name="body"
          component="textarea"
          validate={composeValidators(
            requiredField,
            mustBeAboveNumWords(getMinNumWords(template?.data.fields))
          )}
        >
          {({ input, meta }) => (
            <div>
              <textarea
                {...input}
                rows={10}
                placeholder="Describe your ideas, detail the value you aim to deliver, and link any relevant documents."
                className={`mt-1 bg-wet-concrete text-marble-white p-2 rounded w-full ${
                  !activeUser?.discordId && "h-[200px]"
                }`}
              />
              {/* this error shows up when the user focuses the field (meta.touched) */}
              {meta.error && meta.touched && (
                <span className=" text-xs text-torch-red block">{meta.error}</span>
              )}
            </div>
          )}
        </Field>
      )}
      <div className="mt-6 pb-1">
        <label className="font-bold block">Verify with Discord*</label>
        <p className="text-concrete text-sm">Connect your Discord account to verify</p>
        {!activeUser?.discordId ? (
          <button
            type="button"
            className="mt-3 border border-marble-white text-marble-white rounded flex flex-row py-2 px-6 hover:bg-wet-concrete"
            onClick={(e) => {
              e.preventDefault()
              if (!activeUser?.address) {
                toggleWalletModal(true)
              } else {
                setIsDiscordModalOpen(true)
              }
            }}
          >
            <Image src={DiscordIcon} alt="Discord icon" width={20} height={20} />
            <p className="pl-2">Connect Discord</p>
          </button>
        ) : (
          <button
            disabled
            className="mt-3 border border-marble-white text-marble-white rounded flex flex-row py-2 px-6 opacity-70 cursor-not-allowed"
          >
            <Image src={DiscordIcon} alt="Discord icon" width={20} height={20} />
            <p className="pl-2">Connected to Discord</p>
          </button>
        )}
      </div>
    </>
  )
}

export default FoxesFormStepPropose
