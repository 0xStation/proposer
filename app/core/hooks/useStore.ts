import create from "zustand"
import { Account } from "../../account/types"

interface StoreState {
  activeUser: undefined | Account | null
  walletModalOpen: boolean
  accountModalOpen: boolean
  toastState: {
    isToastShowing: boolean
    message: string
    type: "success" | "error"
  }
  toggleWalletModal: (boolean) => void
  toggleAccountModal: (boolean) => void
  setToastState: (toastState: any) => void
  setActiveUser: (user: undefined | Account | null) => void
}

const useStore = create<StoreState>((set) => ({
  activeUser: undefined, // undefined on start, Account if found, null if not found
  walletModalOpen: false,
  accountModalOpen: false,
  toastState: {
    isToastShowing: false,
    message: "",
    type: "success",
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
