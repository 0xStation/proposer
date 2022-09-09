import create from "zustand"
import { Account } from "../../account/types"
import { Chain } from "wagmi"

interface StoreState {
  activeUser: undefined | Account | null
  walletModalOpen: boolean
  accountModalOpen: boolean
  toastState: {
    isToastShowing: boolean
    message: string
    type: "success" | "error"
  }
  activeChain: Chain | undefined
  toggleWalletModal: (boolean) => void
  toggleAccountModal: (boolean) => void
  setToastState: (toastState: any) => void
  setActiveUser: (user: undefined | Account | null) => void
  setActiveChain: (chain: Chain | undefined) => void
}

const useStore = create<StoreState>((set) => ({
  activeUser: undefined, // undefined on start, Account if found, null if not found
  walletModalOpen: false,
  accountModalOpen: false,
  activeChain: undefined,
  toastState: {
    isToastShowing: false,
    message: "",
    type: "success",
  },
  setActiveChain: (state) => {
    set(() => {
      return { activeChain: state }
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
  setToastState: (toastState) =>
    set((state) => ({
      toastState: {
        isToastShowing: toastState.isToastShowing,
        message: toastState.message,
        type: toastState.type,
      },
    })),
  setActiveUser: (user) =>
    set(() => {
      return { activeUser: user }
    }),
}))

export default useStore
