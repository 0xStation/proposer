import create from "zustand"
import { Account } from "../../account/types"

interface StoreState {
  authorized: boolean
  siweAddress: undefined | string
  activeUser: undefined | Account | null
  walletModalOpen: boolean
  accountModalOpen: boolean
  shouldRefetchEndorsementPoints: boolean
  setAuthorized: (boolean) => void
  setSiweAddress: (string) => void
  toggleWalletModal: (boolean) => void
  toggleAccountModal: (boolean) => void
  setActiveUser: (user: undefined | Account | null) => void
  setShouldRefetchEndorsementPoints: (boolean) => void
}

const useStore = create<StoreState>((set) => ({
  authorized: false,
  siweAddress: undefined,
  activeUser: undefined, // undefined on start, Account if found, null if not found
  walletModalOpen: false,
  accountModalOpen: false,
  shouldRefetchEndorsementPoints: false,
  setAuthorized: (state) => {
    set(() => {
      return { siweAddress: state }
    })
  },
  setSiweAddress: (state) => {
    set(() => {
      return { siweAddress: state }
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
  setShouldRefetchEndorsementPoints: (state) => {
    set(() => {
      return { shouldRefetchEndorsementPoints: state }
    })
  },
}))

export default useStore
