import { BlitzPage, GetServerSideProps, getSession, invoke } from "blitz"
import { useState } from "react"
import Navigation from "app/terminal/components/settings/navigation"
import { Field, Form } from "react-final-form"
import useStore from "app/core/hooks/useStore"
import LayoutWithoutNavigation from "app/core/layouts/LayoutWithoutNavigation"
import { useQuery, useMutation, useParam } from "blitz"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import hasAdminPermissionsBasedOnTags from "app/permissions/queries/hasAdminPermissionsBasedOnTags"

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  const session = await getSession(req, res)

  if (!session?.userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  const terminal = await invoke(getTerminalByHandle, { handle: params?.terminalHandle as string })

  const hasTagAdminPermissions = await invoke(hasAdminPermissionsBasedOnTags, {
    terminalId: terminal?.id as number,
    accountId: session?.userId as number,
  })

  if (
    !terminal?.data?.permissions?.accountWhitelist?.includes(session?.siwe?.address as string) &&
    !hasTagAdminPermissions
  ) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  return {
    props: {}, // will be passed to the page component as props
  }
}

/**
 * THIS IS A DEV TOOL
 * this is not production code
 * this is not meant to have good UX or be what users see/touch
 * this is meant to help Conner do stuff
 */

const PlaygroundPage: BlitzPage = () => {
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const terminalHandle = useParam("terminalHandle") as string
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle },
    { suspense: false, enabled: !!terminalHandle }
  )

  return (
    <LayoutWithoutNavigation>
      <Navigation>
        <section className="flex-1 ml-10">
          <h2 className="text-marble-white text-2xl font-bold mt-10">Playground</h2>
          <Form
            onSubmit={async (values: any, form) => {
              console.log("submit")
            }}
            render={({ form, handleSubmit }) => {
              const formState = form.getState()
              const disableSubmit = true
              return (
                <form onSubmit={handleSubmit}>
                  <div className="w-1/3 flex flex-col col-span-2 mt-6">
                    <button
                      type="submit"
                      className={`rounded text-tunnel-black text-bold px-8 py-2 w-full mt-12 ${
                        disableSubmit ? "bg-concrete" : "bg-electric-violet"
                      }`}
                      disabled={disableSubmit}
                    >
                      Button
                    </button>
                  </div>
                </form>
              )
            }}
          />
        </section>
      </Navigation>
    </LayoutWithoutNavigation>
  )
}

PlaygroundPage.suppressFirstRenderFlicker = true

export default PlaygroundPage
