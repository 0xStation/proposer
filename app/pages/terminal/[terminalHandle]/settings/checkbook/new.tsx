import { BlitzPage, useMutation, useParam, useQuery, Link, Image, Routes, useRouter } from "blitz"
import { Field, Form } from "react-final-form"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import createCheckbook from "app/checkbook/mutations/createCheckbook"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import Navigation from "app/terminal/components/settings/navigation"
import useStore from "app/core/hooks/useStore"
import Back from "/public/back-icon.svg"
import networks from "app/utils/networks.json"

const NewCheckbookSettingsPage: BlitzPage = () => {
  const router = useRouter()
  const [createCheckbookMutation] = useMutation(createCheckbook)

  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(getTerminalByHandle, { handle: terminalHandle }, { suspense: false })

  const setToastState = useStore((state) => state.setToastState)

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <div className="px-6 py-8">
          <div className="flex flex-row space-x-4">
            <Link href={Routes.CheckbookSettingsPage({ terminalHandle })}>
              <Image
                src={Back}
                alt="Close button"
                width={16}
                height={16}
                className="cursor-pointer"
              />
            </Link>
            <h1 className="text-2xl font-bold">New Checkbook</h1>
          </div>
          <Form
            initialValues={{}}
            onSubmit={async (values) => {
              if (terminal) {
                try {
                  //   const metadataResponse = await fetch("/api/fetch-token-metadata", {
                  //     method: "POST",
                  //     headers: {
                  //       Accept: "application/json, text/plain, */*",
                  //       "Content-Type": "application/json",
                  //     },
                  //     body: JSON.stringify({
                  //       address: values.address,
                  //       chainId: parseInt(values.chainId) || 1,
                  //     }),
                  //   })

                  //   const metadata = await metadataResponse.json()

                  //   if (metadata.response !== "success") {
                  //     setToastState({
                  //       isToastShowing: true,
                  //       type: "error",
                  //       message: metadata.message,
                  //     })

                  //     return
                  //   }

                  try {
                    await createCheckbookMutation({
                      terminalId: terminal.id,
                      address: "0xcheckbook",
                      chainId: 1,
                      name: values.name,
                    })

                    router.push(Routes.CheckbookSettingsPage({ terminalHandle }))
                  } catch (e) {
                    console.error(e)
                    setToastState({
                      isToastShowing: true,
                      type: "error",
                      message: "Checkbook creation failed.",
                    })
                  }
                } catch (e) {
                  console.error(e)
                }
              }
            }}
            render={({ form, handleSubmit }) => {
              const formState = form.getState()
              return (
                <form onSubmit={handleSubmit} className="mt-12">
                  <div className="flex flex-col w-1/2">
                    <h3 className="font-bold">Checkbook name*</h3>
                    <Field
                      name="name"
                      component="input"
                      placeholder="e.g. 2022 Q3 Grants"
                      className="bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                    />
                    <h3 className="font-bold mt-4">Checkbook signers*</h3>
                    <span className="text-xs text-concrete block">
                      Insert wallet addresses whose signatures are required to create checks, deploy
                      funds, and edit this Checkbook’s information.
                    </span>
                    <Field
                      name="signers"
                      component="input"
                      type="text"
                      placeholder="Enter wallet addresses or ENS names"
                      className="bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                    />
                    <h3 className="font-bold mt-4">Approval quorum*</h3>
                    <span className="text-xs text-concrete block">
                      The number of signers required for a proposal to be approved and for a check
                      to be generated.
                      <br />
                      <a href="#" className="text-magic-mint">
                        Learn more
                      </a>
                    </span>
                    <Field
                      name="quorum"
                      component="input"
                      type="text"
                      placeholder="0"
                      className="bg-wet-concrete border border-light-concrete rounded p-2 mt-1"
                    />
                    <div>
                      <button
                        className={`rounded text-tunnel-black px-8 py-2 h-full mt-12 ${
                          formState.dirty ? "bg-magic-mint" : "bg-concrete"
                        }`}
                        type="submit"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </form>
              )
            }}
          />
        </div>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

export default NewCheckbookSettingsPage
