import create from "zustand"
import { Account } from "../../account/types"
import produce from "immer"

interface StoreState {
  activeUser: undefined | Account | null
  walletModalOpen: boolean
  accountModalOpen: boolean
  toggleWalletModal: (boolean) => void
  toggleAccountModal: (boolean) => void
  setActiveUser: (user: undefined | Account | null) => void
  setActiveUserApplications: (initiatives: any[] | undefined) => void
}

const useStore = create<StoreState>((set) => ({
  activeUser: undefined, // undefined on start, Account if found, null if not found
  walletModalOpen: false,
  accountModalOpen: false,
  toggleWalletModal: (state) => {
    set(() => {
      return { walletModalOpen: state }
    })
  },
  toggleAccountModal: (state) => {
    set(() => {
      return { accountModalOpen: state }
    })
  },
  setActiveUser: (user) =>
    set(() => {
      return { activeUser: user }
    }),
  setActiveUserApplications: (applications) =>
    set(
      produce((draft) => {
        if (draft.activeUser) {
          draft.activeUser.initiatives = applications
        }
      })
    ),
}))

export default useStore
