import { useCheckUserIsParticipant } from "app/proposalParticipant/hooks/useCheckUserIsParticipant"
import useStore from "./useStore"

const useCommentPermissions = (proposalId) => {
  const activeUser = useStore((state) => state.activeUser)
  const userIsParticipant = useCheckUserIsParticipant(proposalId, activeUser?.address || "")

  const canRead = true
  const canWrite = userIsParticipant

  return { canRead, canWrite }
}

export default useCommentPermissions
