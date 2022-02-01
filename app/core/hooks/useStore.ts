import create from "zustand"
import { Account } from "../../account/types"

interface StoreState {
  address: string | null
  activeUser: Account | null
  walletModalOpen: boolean
  accountModalOpen: boolean
  setAddress: (string) => void
  toggleWalletModal: (boolean) => void
  toggleAccountModal: (boolean) => void
  setActiveUser: (user: Account | null) => void
}

const useStore = create<StoreState>((set) => ({
  address: null,
  activeUser: null,
  walletModalOpen: false,
  accountModalOpen: false,
  setAddress: (address) => {
    set(() => {
      return { address: address }
    })
  },
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
