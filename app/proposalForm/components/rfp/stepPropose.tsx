import { useState } from "react"
import { Field } from "react-final-form"
import { useRouter } from "next/router"
import { useQuery } from "@blitzjs/rpc"
import { useParam, Routes } from "@blitzjs/next"
import { composeValidators, mustBeAboveNumWords, requiredField } from "app/utils/validators"
import TextLink from "app/core/components/TextLink"
import { LINKS } from "app/core/utils/constants"
import useDisplayAddress from "app/core/hooks/useDisplayAddress"
import getRfpById from "app/rfp/queries/getRfpById"
import Preview from "app/core/components/MarkdownPreview"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"
import { useSession } from "@blitzjs/auth"
import useStore from "app/core/hooks/useStore"
import ConnectDiscordModal from "app/core/components/ConnectDiscordModal"
import { SocialConnection } from "app/rfp/types"
import Image from "next/image"
import DiscordIcon from "/public/discord-icon.svg"

export const RfpProposalFormStepPropose = ({ formState }) => {
  const session = useSession({ suspense: false })
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState<boolean>(false)
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const rfpId = useParam("rfpId") as string
  const router = useRouter()
  const activeUser = useStore((state) => state.activeUser)

  const [rfp] = useQuery(
    getRfpById,
    {
      id: rfpId as string,
    },
    {
      enabled: !!rfpId,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
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

  const { text: toDisplayAddress } = useDisplayAddress(rfp?.accountAddress)

  return (
    <>
      {rfp?.data?.requiredSocialConnections?.includes(SocialConnection.DISCORD) &&
        activeUser &&
        !activeUser?.discordId && (
          <ConnectDiscordModal isOpen={isDiscordModalOpen} setIsOpen={setIsDiscordModalOpen} />
        )}
      {/* TO */}
      <div className="mt-4 flex flex-row w-full items-center justify-between">
        <span className="font-bold">To</span>
        <span className="items-end">{"@" + toDisplayAddress}</span>
      </div>
      {/* TITLE */}
      <label className="font-bold block mt-6">Title*</label>
      <Field name="title" validate={requiredField}>
        {({ meta, input }) => (
          <>
            <input
              {...input}
              type="text"
              required
              placeholder="Add a title for your idea"
              className="bg-wet-concrete rounded mt-1 w-full p-2"
            />

            {meta.touched && meta.error && (
              <span className="text-torch-red text-xs">{meta.error}</span>
            )}
          </>
        )}
      </Field>
      {/* BODY */}
      <div className="flex flex-row justify-between">
        <div className="flex-col">
          <label className="font-bold block mt-6">Details*</label>
          <span className="text-xs text-concrete block">
            {(rfp?.data?.proposal?.body?.minWordCount || 0) > 0
              ? `${rfp?.data?.proposal?.body?.minWordCount} words minimum.`
              : ""}{" "}
            Supports <TextLink url={LINKS.MARKDOWN_GUIDE}>markdown</TextLink>.
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
              <p className="inline text-sm text-concrete">Preview</p>{" "}
              <EyeIcon className="inline h-5 w-5 fill-concrete" />
            </>
          )}
        </button>
      </div>
      {previewMode ? (
        <div className="mt-1 bg-wet-concrete text-marble-white p-2 rounded min-h-[236px] w-full ">
          <Preview markdown={formState.values.body} />
        </div>
      ) : (
        <Field
          name="body"
          component="textarea"
          validate={composeValidators(
            requiredField,
            mustBeAboveNumWords(rfp?.data?.proposal?.body?.minWordCount || 0)
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
      )}
      {rfp?.data?.requiredSocialConnections?.includes(SocialConnection.DISCORD) && (
        <>
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
      )}
    </>
  )
}

export default RfpProposalFormStepPropose