import { BlitzPage } from "blitz"
import { useState } from "react"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/Navigation"
import Modal from "../../../core/components/Modal"

const TerminalContributorsPage: BlitzPage = () => {
  let [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Modal
        title="test"
        subtitle="im just testing this darn thing"
        open={isOpen}
        toggle={setIsOpen}
      >
        <div className="text-marble-white">contents</div>
      </Modal>
      <TerminalNavigation>
        <button
          className="bg-magic-mint text-tunnel-black px-2 py-1"
          onClick={() => {
            setIsOpen(true)
          }}
        >
          Open Modal
        </button>
      </TerminalNavigation>
    </>
  )
}

TerminalContributorsPage.suppressFirstRenderFlicker = true
TerminalContributorsPage.getLayout = (page) => <Layout title="Initiatives">{page}</Layout>

export default TerminalContributorsPage
