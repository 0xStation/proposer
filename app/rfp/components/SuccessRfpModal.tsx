import { useState } from "react"
import Modal from "app/core/components/Modal"
import { genBaseUrl } from "app/utils"
import Button from "app/core/components/sds/buttons/Button"

export const SuccessRfpModal = ({ terminal, isOpen, setIsOpen, rfpId, isEdit = true }) => {
  const [isUrlCopied, setIsUrlCopied] = useState<boolean>(false)
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold pt-6">
          {isEdit ? "Changes published!" : "Project published!"}
        </h3>
        <p className="mt-2 mr-24">
          Share the link with your community to solicit proposals to shape the future of{" "}
          {terminal?.data?.name}.
        </p>
        <div className="mt-8">
          <Button
            onClick={() => {
              navigator.clipboard
                .writeText(`${genBaseUrl()}/station/${terminal?.handle}/bulletin/rfp/${rfpId}/info`)
                .then(() => {
                  setIsUrlCopied(true)
                  setTimeout(() => setIsUrlCopied(false), 2000)
                })
            }}
          >
            {isUrlCopied ? "Copied!" : "Copy link"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default SuccessRfpModal
