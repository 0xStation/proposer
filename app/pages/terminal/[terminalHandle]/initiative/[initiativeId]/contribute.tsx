import { useState } from "react"
import { BlitzPage, useQuery, useParam, useRouter, Image, Routes, useMutation } from "blitz"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getInitiativeByLocalId from "app/initiative/queries/getInitiativeByLocalId"
import Exit from "public/exit-button.svg"
import { Field, Form } from "react-final-form"
import { composeValidators, mustBeUrl, requiredField } from "app/utils/validators"
import Modal from "app/core/components/Modal"
import { Button } from "app/core/components/Button"
import { QUERY_PARAMETERS } from "app/core/utils/constants"
import createApplication from "app/application/mutations/createApplication"
import { sendNewApplicationNotification } from "app/utils/sendDiscordNotification"
import Globe from "/public/mirror-logo.svg"

export const ApplicationConfirmationModal = ({
  confirmationOpen,
  setIsConfirmationOpen,
  urlField,
  entryDescription,
  onClick,
}) => {
  return (
    <Modal
      title="Confirm your submission"
      open={confirmationOpen}
      toggle={(close) => setIsConfirmationOpen(false)}
    >
      <div className="text-center py-10 px-8">
        <p className="py-1">
          You won&apos;t be able to edit your submission until the first day of next month.
        </p>
        <p>Would you like to send in your submission now?</p>
      </div>
      <Button className="px-10 my-5" onClick={() => onClick({ urls: urlField, entryDescription })}>
        Confirm
      </Button>
    </Modal>
  )
}

const TerminalInitiativeContributePage: BlitzPage = () => {
  const router = useRouter()
  const terminalHandle = useParam("terminalHandle", "string") as string
  const initiativeLocalId = useParam("initiativeId", "number") as number
  const activeUser = useStore((state) => state.activeUser)
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })
  const [initiative] = useQuery(
    getInitiativeByLocalId,
    {
      terminalId: terminal?.id,
      localId: initiativeLocalId,
    },
    { suspense: false, enabled: !!terminal?.id }
  )

  const [urlField, setUrlField] = useState<string[]>([])
  const [entryDescriptionField, setEntryDescriptionField] = useState<string>("")
  const [confirmationOpen, setIsConfirmationOpen] = useState<boolean>(false)
  const { DIRECTED_FROM } = QUERY_PARAMETERS
  const [createApplicationMutation] = useMutation(createApplication, {
    onSuccess: () => {
      router.push(
        `/terminal/${terminalHandle}/waiting-room?directedFrom=${DIRECTED_FROM.SUBMITTED_APPLICATION}`
      )
    },
  })

  // TODO: check for activeUser - right now we're relying on being redirected to the account creation page
  // if the user doesn't have an account

  return (
    <Layout
      title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Join ${
        initiative?.data?.name || "Initiative"
      }`}
    >
      <ApplicationConfirmationModal
        confirmationOpen={confirmationOpen}
        setIsConfirmationOpen={setIsConfirmationOpen}
        urlField={urlField}
        entryDescription={entryDescriptionField}
        onClick={async (values) => {
          try {
            await createApplicationMutation({
              ...values,
              initiativeId: initiative?.id,
              accountId: activeUser?.id,
            })
            // send message to terminal's #station-notifications discord channel if applicable
            await sendNewApplicationNotification(
              initiative?.data.name as string,
              activeUser?.data.name as string,
              activeUser?.address as string,
              terminal?.data.discordWebhookUrl
            )
          } catch (error) {
            alert("Error applying.")
          }
        }}
      />
      <div className="bg-tunnel-black min-h-[calc(100vh-15rem)] h-[1px] relative">
        <div className="absolute top-3 left-5">
          <div className="w-[24px] h-[24px]">
            <button
              className="text-marble-white"
              onClick={() =>
                router.push(Routes.Project({ terminalHandle, initiativeId: initiativeLocalId }))
              }
            >
              <Image src={Exit} alt="Close button" width={24} height={24} />
            </button>
          </div>
        </div>
        <h1 className="text-marble-white text-4xl text-center pt-12">
          Join {initiative?.data?.name || "Initiative"}
        </h1>
        <div className="mx-auto max-w-2xl pb-12 mt-9">
          <Form
            onSubmit={async (values: { url: string[]; entryDescription: string }) => {
              const { url, entryDescription } = values
              setUrlField(url)
              setEntryDescriptionField(entryDescription)
              setIsConfirmationOpen(true)
            }}
            render={({ handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div className="flex flex-col col-span-2">
                    <label htmlFor="url" className="text-marble-white">
                      Share a link to a proposal or a project you&apos;re proud of*
                    </label>
                    <Field name="url[0]" validate={composeValidators(requiredField, mustBeUrl)}>
                      {({ input, meta }) => (
                        <div>
                          <div className="h-10 w-full border border-concrete bg-wet-concrete text-marble-white placeholder:text-concrete mb-2 mt-2">
                            <div className="mx-2 w-[2%] inline">
                              <Image src={Globe} alt="Globe Logo." width={14} height={14} />
                            </div>
                            <input
                              {...input}
                              type="text"
                              placeholder="e.g. github, mirror, notion, discord, discourse"
                              className="h-full inline min-w-[90%] sm:w-[95%] bg-wet-concrete text-marble-white placeholder:text-concrete"
                            />
                          </div>
                          {/* this error shows up when the user focuses the field (meta.touched) */}
                          {meta.error && meta.touched && (
                            <span className=" text-xs text-torch-red mb-2 block">{meta.error}</span>
                          )}
                        </div>
                      )}
                    </Field>
                    <Field name="url[1]" validate={mustBeUrl}>
                      {({ input, meta }) => (
                        <div>
                          <div className="h-10 w-full border border-concrete bg-wet-concrete text-marble-white placeholder:text-concrete mb-2">
                            <div className="mx-2 w-[2%] inline">
                              <Image src={Globe} alt="Globe Logo." width={14} height={14} />
                            </div>
                            <input
                              {...input}
                              type="text"
                              placeholder="e.g. github, mirror, notion, discord, discourse"
                              className="h-full inline min-w-[90%] sm:w-[95%] bg-wet-concrete text-marble-white placeholder:text-concrete"
                            />
                          </div>
                          {/* this error shows up when the user focuses the field (meta.touched) */}
                          {meta.error && meta.touched && (
                            <span className=" text-xs text-torch-red mb-2 block">{meta.error}</span>
                          )}
                        </div>
                      )}
                    </Field>
                    <Field name="url[2]" validate={mustBeUrl}>
                      {({ input, meta }) => (
                        <div>
                          <div className="h-10 w-full border border-concrete bg-wet-concrete text-marble-white placeholder:text-concrete mb-2">
                            <div className="mx-2 w-[2%] inline">
                              <Image src={Globe} alt="Globe Logo." width={14} height={14} />
                            </div>
                            <input
                              {...input}
                              type="text"
                              placeholder="e.g. github, mirror, notion, discord, discourse"
                              className="h-full inline min-w-[90%] sm:w-[95%] bg-wet-concrete text-marble-white placeholder:text-concrete"
                            />
                          </div>
                          {/* this error shows up when the user focuses the field (meta.touched) */}
                          {meta.error && meta.touched && (
                            <span className=" text-xs text-torch-red mb-2 block">{meta.error}</span>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>
                  <div className="flex flex-col col-span-2 mt-4">
                    <label htmlFor="entryDescription" className="text-marble-white">
                      {initiative?.data.applicationQuestion ||
                        `What unique value are you looking to bring to ${
                          initiative?.data.name || "this initiative"
                        }`}
                      *
                    </label>
                    <Field name="entryDescription" validate={requiredField}>
                      {({ input, meta }) => (
                        <div>
                          <textarea
                            {...input}
                            placeholder="Highlight your unique value in 3-5 sentences"
                            className="w-full mt-1 border border-concrete bg-wet-concrete text-marble-white p-2 placeholder:text-concrete"
                          />
                          {/* this error shows up when the user focuses the field (meta.touched) */}
                          {meta.error && meta.touched && (
                            <span className=" text-xs text-torch-red mb-2 block">{meta.error}</span>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-magic-mint text-tunnel-black w-1/2 rounded mt-12 mx-auto block p-2 hover:opacity-70"
                >
                  Submit
                </button>
              </form>
            )}
          />
        </div>
      </div>
    </Layout>
  )
}

TerminalInitiativeContributePage.suppressFirstRenderFlicker = true

export default TerminalInitiativeContributePage
