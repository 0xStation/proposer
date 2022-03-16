import Modal from "../Modal"
import ExploreView from "./ExploreView"

const ExploreModal = ({ isExploreModalOpen, setIsExploreModalOpen }) => {
  return (
    <Modal
      title="Explore"
      open={isExploreModalOpen}
      toggle={(close) => setIsExploreModalOpen(false)}
    >
      <ExploreView className="h-[13rem]" />
    </Modal>
  )
}

export default ExploreModal
