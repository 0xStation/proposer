import { useState } from "react"
import { BlitzPage } from "blitz"
import { LockClosedIcon } from "@heroicons/react/outline"
import Layout from "app/core/layouts/Layout"
import useStore from "app/core/hooks/useStore"
import truncateString from "app/core/utils/truncateString"
import { DEFAULT_PFP_URLS } from "app/core/utils/constants"
// import Preview from "app/core/components/MarkdownPreview"

const CreateRFPPage: BlitzPage = () => {
  const [markdown, setMarkdown] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const activeUser = useStore((state) => state.activeUser)

  return (
    <Layout title={`New RFP`}>
      <div className="grid grid-cols-3 h-screen w-full box-border">
        <div className="overflow-y-auto col-span-2 p-20">
          <div className="flex flex-row items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-concrete" />
            <span className="text-xs uppercase tracking-wider">Draft</span>
          </div>
          <div className="mt-6 flex flex-row">
            <span className="text-3xl font-bold">RFP:</span>
            <input
              className="bg-tunnel-black text-3xl ml-2 w-full"
              placeholder="Give your request a title..."
            />
          </div>
          <div className="mt-6 flex flex-row">
            {/* are proposals just for logged in user, or connected users (with no account) okay too? */}
            <img
              src={activeUser?.data.pfpURL}
              alt="PFP"
              className={"w-[46px] h-[46px] rounded-full"}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.USER
              }}
            />
            <div className="ml-2">
              <span>{activeUser?.data.name}</span>
              <span className="text-xs text-light-concrete flex mt-1">
                @{truncateString(activeUser?.address, 4)}
              </span>
            </div>
          </div>
          <div className="mt-12 h-full">
            {!previewMode ? (
              <textarea
                value={markdown}
                className="bg-tunnel-black w-full h-full outline-none resize-none"
                onChange={(e) => setMarkdown(e.target.value.length > 0 ? e.target.value : "")}
                placeholder="enter some text..."
              />
            ) : (
              <div></div>
              // <Preview markdown={markdown} />
            )}
          </div>
          <div className="absolute bottom-10 left-[450px]">
            <button
              className={`border rounded p-1 mr-2 ${
                !previewMode && "bg-marble-white text-tunnel-black"
              }`}
              onClick={() => setPreviewMode(false)}
            >
              Edit
            </button>
            <button
              className={`border rounded p-1 mr-2 ${
                previewMode && "bg-marble-white text-tunnel-black"
              }`}
              onClick={() => setPreviewMode(true)}
            >
              Preview
            </button>
          </div>
        </div>
        <div className="h-full border-l border-concrete col-span-1 flex flex-col">
          <div className="border-b border-concrete p-4 flex flex-row space-x-8">
            <span className="font-bold">General</span>
            <div className="flex flex-row space-x-1 items-center">
              <LockClosedIcon className="h-4 w-4 hover:stroke-light-concrete text-concrete cursor-pointer" />
              <span className="text-concrete">Permission</span>
            </div>
            <div className="flex flex-row space-x-1 items-center">
              <LockClosedIcon className="h-4 w-4 hover:stroke-light-concrete text-concrete cursor-pointer" />
              <span className="text-concrete">Custom Questions</span>
            </div>
          </div>
          <div className="p-4 grow flex flex-col justify-between">
            <div>
              <label className="font-bold block">Checkbook*</label>
              <span className="text-xs text-concrete block">
                Checkbook is where you deposit funds to create checks for proposers to claim once
                their projects have been approved.{" "}
                <a href="#" className="text-magic-mint">
                  Learn more
                </a>
              </span>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex flex-col">
                  <label className="font-bold">Start Date</label>
                  <span className="text-xs text-concrete block">Proposal submission open</span>
                  <input
                    type="date"
                    className="bg-wet-concrete border border-concrete rounded p-1 mt-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-bold">End Date</label>
                  <span className="text-xs text-concrete block">Proposal submission closed</span>
                  <input
                    type="date"
                    className="bg-wet-concrete border border-concrete rounded p-1 mt-1"
                  />
                </div>
              </div>
            </div>
            <div>
              <button className="bg-magic-mint text-tunnel-black px-6 py-1 rounded block mx-auto">
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

CreateRFPPage.suppressFirstRenderFlicker = true
export default CreateRFPPage
