import create from "zustand"
import { Account } from "../../account/types"

interface StoreState {
  activeUser: Account | null
  walletModalOpen: boolean
  accountModalOpen: boolean
  toggleWalletModal: (boolean) => void
  toggleAccountModal: (boolean) => void
  setActiveUser: (user: Account | null) => void
}

const useStore = create<StoreState>((set) => ({
  activeUser: null,
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
}))

export default useStore
