import { BlitzPage, useParam, useMutation, useQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import getTerminalById from "app/terminal/queries/getTerminalById"
import getInitiativeByLocalId from "app/initiative/queries/getInitiativeByLocalId"
import updateInitiative from "app/initiative/mutations/updateInitiative"
import { Field, Form } from "react-final-form"

export type UpdateMetadata = {
  name: string
  description: string
  shortName: string
  oneLiner: string
  contributeText: string
  rewardText: string
}

const AdminEditInitiative: BlitzPage = () => {
  const initiativeLocalId = useParam("initiativeId", "number") as number
  const [terminal] = useQuery(getTerminalById, { id: 1 }, { suspense: false })

  const [initiative] = useQuery(
    getInitiativeByLocalId,
    { localId: initiativeLocalId, terminalTicket: terminal?.ticketAddress || "" },
    { suspense: false }
  )

  console.log(initiative)
  const [updateInitiativeMutation] = useMutation(updateInitiative)

  return (
    <div
      className="w-full h-full bg-cover bg-center bg-no-repeat border"
      style={{ backgroundImage: "url('/station-cover.png')" }}
    >
      <div className="bg-tunnel-black min-h-[calc(100vh-15rem)] h-[1px] mt-36">
        <div className="grid gap-0 grid-cols-1 md:grid-cols-3 xl:grid-cols-4 max-w-screen-xl h-full mx-auto">
          <div className="col-span-1 pl-4 text-2xl border-concrete border-b pb-12 md:border-b-0 md:border-r md:pr-6 h-full">
            <div className="flex items-center mt-12">
              <div className="flex flex-col">
                <h1 className="text-2xl text-marble-white">Station</h1>
                <h4 className="text-base capitalize text-marble-white">ADMIN</h4>
              </div>
            </div>
            <ul className="mt-9 text-lg">
              <a href="/admin/initiatives">
                <li className="text-concrete cursor-pointer hover:text-marble-white">
                  Initiatives
                </li>
              </a>
            </ul>
          </div>
          <div className="col-span-2 xl:col-span-3 px-6 pb-12">
            <div className="mt-12">
              <h1 className="text-marble-white text-2xl mb-4">Edit Initiative</h1>
              <Form
                initialValues={initiative?.data}
                onSubmit={async (values: UpdateMetadata) => {
                  try {
                    await updateInitiativeMutation({ ...values, id: initiativeLocalId })
                  } catch (error) {
                    alert("Error applying.")
                  }
                }}
                render={({ handleSubmit }) => (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div className="flex flex-col">
                        <label htmlFor="name" className="text-marble-white">
                          Name
                        </label>
                        <Field
                          component="input"
                          name="name"
                          placeholder="name"
                          className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="shortName" className="text-marble-white">
                          Short Name
                        </label>
                        <Field
                          component="input"
                          name="shortName"
                          placeholder="short name"
                          className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                        />
                      </div>
                      <div className="flex flex-col col-span-2">
                        <label htmlFor="oneLiner" className="text-marble-white">
                          One Liner
                        </label>
                        <Field
                          component="input"
                          name="oneLiner"
                          placeholder="oneLiner"
                          className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                        />
                      </div>
                      <div className="flex flex-col col-span-2">
                        <label htmlFor="description" className="text-marble-white">
                          Description
                        </label>
                        <Field
                          component="textarea"
                          name="description"
                          placeholder="description"
                          className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                        />
                      </div>

                      <div className="flex flex-col col-span-2">
                        <label htmlFor="contributeText" className="text-marble-white">
                          Contribute Text
                        </label>
                        <Field
                          component="textarea"
                          name="contributeText"
                          placeholder="contributeText"
                          className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                        />
                      </div>
                      <div className="flex flex-col col-span-2">
                        <label htmlFor="rewardText" className="text-marble-white">
                          Reward Text
                        </label>
                        <Field
                          component="textarea"
                          name="rewardText"
                          placeholder="rewardText"
                          className="mt-1 border border-concrete bg-wet-concrete text-marble-white p-2"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-magic-mint text-tunnel-black w-full rounded mt-12 mx-auto block p-2"
                    >
                      Submit
                    </button>
                  </form>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

AdminEditInitiative.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>
export default AdminEditInitiative
